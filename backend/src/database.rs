use axum::{Json, extract::Path, http::StatusCode, response::IntoResponse};
use rusqlite::{Connection, Result};

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
    println!("init_db rodou!");
    Ok(conn)
}

// Save Book Page
pub async fn save_last_page(
    Path((title, page)): Path<(String, u16)>,
) -> Result<StatusCode, StatusCode> {
    let conn = Connection::open("./main.db").unwrap();
    match conn.execute(
        "UPDATE books SET last_page = ?1 WHERE title = ?2",
        (page, title),
    ) {
        Ok(_) => Ok(StatusCode::OK),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

// Get Book Page by Name

// Add/Delete books by books Array
pub async fn check_books(Json(titles): Json<Vec<String>>) -> impl IntoResponse {
    let conn = Connection::open("./main.db").unwrap();

    println!("check_books rodou!");

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
        let rows = conn
            .execute("INSERT OR IGNORE INTO books (title) VALUES (?1)", [nome])
            .unwrap();
        println!("inserido '{}': {} rows", nome, rows);
    }

    println!("titles: {:?}", titles);
    println!("query: {}", query);
    println!(
        "rows deletados: {}",
        conn.execute(&query, params.as_slice()).unwrap()
    );

    StatusCode::OK
}
