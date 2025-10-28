import './loading.css'

export default function Loading({ isLoading = true }) {
    if (!isLoading) return null; // Don't render if not loading
    
    return (
        <div className="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    );
}