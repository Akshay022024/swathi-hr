export default function StarRating({ rating = 0, size = '1rem' }) {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.3

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push(<span key={i} className="star filled" style={{ fontSize: size }}>★</span>)
        } else if (i === fullStars && hasHalf) {
            stars.push(<span key={i} className="star half" style={{ fontSize: size }}>★</span>)
        } else {
            stars.push(<span key={i} className="star" style={{ fontSize: size }}>★</span>)
        }
    }

    return <div className="star-rating">{stars}</div>
}
