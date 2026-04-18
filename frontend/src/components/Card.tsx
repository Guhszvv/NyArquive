import { useNavigate } from "react-router-dom";

function Card({ file }: { file: string }) {
  const navigate = useNavigate();
  const storageKey = `pdf-page-${file}`;
  const savedPage = Number(localStorage.getItem(storageKey));
  const maxPage = Number(localStorage.getItem("max_page") ?? "1");
  const progress = Math.round((savedPage / maxPage) /10);

  return (
    <div
      className="card"
      onClick={() => navigate(`/viewer/${encodeURIComponent(file)}`)}
    >
      <img src={`${import.meta.env.VITE_API_URL}/thumbnail/${encodeURIComponent(file)}`} crossOrigin="anonymous" />

      <div className="card-info">

        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

export default Card;