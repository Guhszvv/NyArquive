import { useEffect, useState } from "react";
import NavBar from '../../components/NavBar';
import Card from '../../components/Card';
import './homepage.css';

function HomePage() {
  const [files, setFiles] = useState<string[]>([]);
  console.log(files);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/files`)
      .then(res => res.json())
      .then(setFiles);
  }, []);

  return (
    <div>
      <NavBar isVisible={true} isViewer={false}/>

      <div className="livros">
        {files.map((file) => (
          <Card key={file} file={file} />
        ))}
      </div>
    </div>
  );
}

export default HomePage;