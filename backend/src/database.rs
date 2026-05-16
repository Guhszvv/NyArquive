use axum::{Json, extract::Path, http::StatusCode, response::IntoResponse};
use rusqlite::Connection;

// Start DB
pub fn init_db(conn: Connection) -> rusqlite::Result<Connection> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS books (
                  id        INTEGER PRIMARY KEY,
                  title     TEXT NOT NULL UNIQUE,
                  last_page INTERGER NOT NULL DEFAULT 0
        )",
        (),
    )?;
    Ok(conn)
}

// Save Book Page
pub async fn save_last_page(Path((title, page)): Path<(String, u16)>) -> impl IntoResponse {
    let conn = Connection::open("./main.db").unwrap();
    conn.execute(
        "UPDATE books SET last_page = ?1 WHERE title = ?2",
        (page, title),
    )
    .unwrap();
    StatusCode::OK
}

// Get Book Last Page by Name
pub async fn get_last_page() -> impl IntoResponse {
    let conn = Connection::open("./main.db").unwrap();
    let mut list = conn.prepare("SELECT title, last_page FROM books").unwrap();
    let books: Vec<(String, u16)> = list
        .query_map([], |row| Ok((row.get(0)?, row.get(1)?)))
        .unwrap()
        .filter_map(|r| r.ok())
        .collect();

    Json(books)
}

// Add/Delete books by books Array
pub async fn check_books(Json(titles): Json<Vec<String>>) -> impl IntoResponse {
    let conn = Connection::open("./main.db").unwrap();

    if titles.is_empty() {
        conn.execute("DELETE FROM books", []).unwrap();
        return StatusCode::OK;
    }

    let placeholders = titles
        .iter()
        .enumerate()
        .map(|(i, _)| format!("?{}", i + 1))
        .collect::<Vec<_>>()
        .join(", ");

    let query = format!("DELETE FROM books WHERE title NOT IN ({})", placeholders);
    let params: Vec<&dyn rusqlite::ToSql> =
        titles.iter().map(|n| n as &dyn rusqlite::ToSql).collect();
    conn.execute(&query, params.as_slice()).unwrap();

    // Insere os que não existem ainda
    for nome in &titles {
        conn.execute("INSERT OR IGNORE INTO books (title) VALUES (?1)", [nome])
            .unwrap();
    }

    StatusCode::OK
}
