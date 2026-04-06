import { useNavigate } from "react-router-dom";

function Card({ file }: { file: string }) {
  const navigate = useNavigate();
  
  return (
    <div
      className="card"
      onClick={() => navigate(`/viewer/${encodeURIComponent(file)}`)}
    >
      <img src={`http://100.67.247.44:3004/thumbnail/${encodeURIComponent(file)}`} crossOrigin="anonymous" />

      <div className="card-info">

        <div className="progress">
          <div className="progress-bar" style={{ width: "60%" }} />
        </div>
      </div>
    </div>
  );
}

export default Card;