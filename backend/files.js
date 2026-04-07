import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const app = express();
const PORT = 3004;

const BOOKS_PATH = path.resolve(process.cwd(), "../books");

app.use(express.static("dist"));

app.use(cors({
  origin: "*",
  methods: ["GET"],
  allowedHeaders: ["Content-Type"],
}));

// Endpoint para listar PDFs
app.get("/files", (req, res) => {
  if (!fs.existsSync(BOOKS_PATH)) {
    return res.status(500).json({ error: "Diretório de livros não encontrado." });
  }

  const files = fs.readdirSync(BOOKS_PATH).filter(f => f.endsWith(".pdf"));
  res.json(files);
});

// Endpoint para servir PDF
app.get("/pdf/:name", (req, res) => {
  const fileName = path.basename(decodeURIComponent(req.params.name));
  const filePath = path.join(BOOKS_PATH, fileName);

  if (!fs.existsSync(filePath)) return res.sendStatus(404);

  res.setHeader("Content-Type", "application/pdf");
  fs.createReadStream(filePath).pipe(res);
});

app.get("/thumbnail/:name", async (req, res) => {
  const tmpOutput = `/tmp/thumb_${Date.now()}`;

  try {
    const fileName = path.basename(decodeURIComponent(req.params.name));
    const filePath = path.join(BOOKS_PATH, fileName);

    if (!fs.existsSync(filePath)) return res.sendStatus(404);

    // Converte só a primeira página para PNG via pdftoppm
    await execFileAsync("pdftoppm", [
      "-png",
      "-f", "1",   // primeira página
      "-l", "1",   // última página (só a 1)
      "-r", "100", // DPI
      "-scale-to", "400",
      filePath,
      tmpOutput,
    ]);

    // pdftoppm gera arquivos como thumb_123-1.png (com zero-padding)
    const files = fs.readdirSync("/tmp").filter(f =>
      f.startsWith(path.basename(tmpOutput)) && f.endsWith(".png")
    );

    if (files.length === 0) {
      return res.status(500).send("Falha ao gerar thumbnail.");
    }

    const imgPath = path.join("/tmp", files[0]);

    res.setHeader("Content-Type", "image/png");
    const stream = fs.createReadStream(imgPath);
    stream.pipe(res);

    // Limpa arquivo temporário após enviar
    res.on("finish", () => fs.unlink(imgPath, () => {}));

  } catch (err) {
    console.error("Erro ao converter PDF:", err);
    // Limpeza de emergência
    fs.readdirSync("/tmp")
      .filter(f => f.startsWith(path.basename(tmpOutput)))
      .forEach(f => fs.unlink(path.join("/tmp", f), () => {}));

    res.status(500).send("Erro ao gerar thumbnail");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('This process is your pid ' + process.pid);
});