import { useNavigate } from "react-router-dom";

function Card({ file }: { file: string }) {
  const navigate = useNavigate();
  
  return (
    <div
      className="card"
      onClick={() => navigate(`/viewer/${encodeURIComponent(file)}`)}
    >
      <img src={`${import.meta.env.VITE_API_URL}/thumbnail/${encodeURIComponent(file)}`} crossOrigin="anonymous" />

      <div className="card-info">

        <div className="progress">
          <div className="progress-bar" style={{ width: "60%" }} />
        </div>
      </div>
    </div>
  );
}

export default Card;