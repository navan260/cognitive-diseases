export default function Landing({ goToAuth }) {
    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h1>Welcome to this world</h1>
            <p>Convert speech → text → syllables → mindmaps</p>

            <button onClick={goToAuth}>
                Login / Signup
            </button>
        </div>
    );
}