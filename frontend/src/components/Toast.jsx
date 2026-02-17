export default function Toast({ toasts }) {
    if (!toasts.length) return null

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast toast-${toast.type}`}>
                    <span>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}</span>
                    <span>{toast.message}</span>
                </div>
            ))}
        </div>
    )
}
