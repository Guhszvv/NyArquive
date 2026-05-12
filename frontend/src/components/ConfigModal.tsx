
function Card(setOpenModal) {
    const apiurl = import.meta.env.VITE_API_URL

    return (
        <div>
            <div className="body">
                <p>API URL: </p>
                <input value={apiurl}></input>
            </div>
            <div className="bottom">
                <button className="cancelButton">Cancelar</button>
                <button className="saveButton">Salvar</button>
            </div>
        </div>
    );
}

export default Card;