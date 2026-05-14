mod database;
use axum::body::Body;
use axum::extract::Path;
use axum::http::{StatusCode, header};
use axum::response::IntoResponse;
use axum::routing::post;
use axum::{Json, Router, routing::get};
use rusqlite::Connection;
use std::fs;
use std::process::Command;
use tokio::fs::File;
use tokio_util::io::ReaderStream;
use tower_http::cors::CorsLayer;
use tower_http::services::{ServeDir, ServeFile};
use uuid::Uuid;

#[tokio::main]
async fn main() {
    println!("╔══════════════════════════════╗");
    println!("║       NyArquive Server       ║");
    println!("╠══════════════════════════════╣");
    println!("║  http://0.0.0.0:3004         ║");
    println!("║  PID: {:<23}║", std::process::id());
    println!("╚══════════════════════════════╝");

    let conn = Connection::open("./main.db").unwrap();
    database::init_db(conn).unwrap();

    let app = Router::new()
        .route("/files", get(get_files))
        .route("/thumbnail/{name}", get(get_thumb))
        .route("/pdf/{name}", get(stream_pdf))
        .route("/book/{title}/{page}", post(database::save_last_page))
        .route("/book/check", post(database::check_books))
        .fallback_service(
            ServeDir::new("./dist/").not_found_service(ServeFile::new("./dist/index.html")),
        )
        .layer(CorsLayer::permissive());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3004").await.unwrap();

    axum::serve(listener, app).await.unwrap();
}

// List pdf's
async fn get_files() -> Json<Vec<String>> {
    let files = fs::read_dir("./books/")
        .unwrap()
        .filter_map(|e| e.ok())
        .map(|e| e.file_name().to_string_lossy().to_string())
        .collect::<Vec<String>>();

    Json(files)
}

// Export books thumbnail
async fn get_thumb(Path(name): Path<String>) -> impl IntoResponse {
    let name = std::path::Path::new(&name)
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();

    let file_path = format!("./books/{}", name);

    // Temporary output
    let tmp_output = format!("/tmp/thumb_{}", Uuid::new_v4());

    let status = Command::new("pdftoppm")
        .args([
            "-png",
            "-f",
            "1",
            "-l",
            "1",
            "-r",
            "100",
            "-scale-to",
            "400",
            &file_path,
            &tmp_output,
        ])
        .output()
        .unwrap();

    if !status.status.success() {
        return (StatusCode::INTERNAL_SERVER_ERROR, "Erro ao converter PDF").into_response();
    }

    // Find generated file
    let prefix = std::path::Path::new(&tmp_output)
        .file_name()
        .unwrap()
        .to_string_lossy()
        .to_string();

    let img_path = fs::read_dir("/tmp")
        .unwrap()
        .filter_map(|e| e.ok())
        .find(|e| {
            let fname = e.file_name().to_string_lossy().to_string();
            fname.starts_with(&prefix) && fname.ends_with(".png")
        })
        .map(|e| e.path());

    let img_path = match img_path {
        Some(p) => p,
        None => return (StatusCode::INTERNAL_SERVER_ERROR, "Thumbnail não gerada").into_response(),
    };

    let bytes = fs::read(&img_path).unwrap();
    fs::remove_file(&img_path).ok();

    ([(header::CONTENT_TYPE, "image/png")], bytes).into_response()
}

// Stream PDF
async fn stream_pdf(Path(name): Path<String>) -> impl IntoResponse {
    let name = std::path::Path::new(&name)
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();

    let file_path = format!("./books/{}", name);
    let file = match File::open(file_path).await {
        Ok(f) => f,
        Err(_) => {
            return (StatusCode::INTERNAL_SERVER_ERROR, "Arquivo não encontrado").into_response();
        }
    };

    let stream = ReaderStream::new(file);
    let body = Body::from_stream(stream);

    ([(header::CONTENT_TYPE, "application/pdf")], body).into_response()
}
