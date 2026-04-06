import { useParams } from "react-router-dom";

function Viewer() {
  const { file } = useParams();
  const encoded = encodeURIComponent(file!);

  return (
      <iframe
        className="viewer"
        style={{height: "100vh", width: "100vw"}}
        src={`http://100.67.247.44:3004/pdf/${encoded}`}
      />
  );
}

export default Viewer;