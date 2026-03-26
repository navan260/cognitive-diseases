import PixelSnow from './PixelSnow';
import './landing.css';

const dyslexiaImages = [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_3wys4e1z3zHSjP0Zfs0Oik-lJycvN5HZzA&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR7QOTYA4fuhtXSNFCCwxnShjWnCzxhBmiHw&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSjGcpaXg7saJP-TfiZ52e9iiZY5tnNxFeLg&s',
    'https://cdn.sanity.io/images/68lp9qid/production/cc0eaf9999c60ae95448087534dd9e9eda663d93-1200x750.jpg/27-june-2022-Dyslexia-editoriall.jpg?rect=37,0,1127,750&w=320&h=213&fit=min&auto=format',
];

const dyscalculiaImages = [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR10hoJTeDUqSjj58gbM6olS3mllTg_AsLRpg&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROKBN3Q9aMQ7ZvgyMz7_TMNsbfKh5yYiTi0w&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUNU4oVMwhoyTqFiRe0Pw2VgkEq4aD7gWVdA&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzcRrFpcMS3vTTt6mKheN34wcgZCG18os2fg&s',
];

const adpImages = [
    'https://torontohearinghealth.com/wp-content/uploads/2024/08/Unlocking-the-Secrets-of-Auditory-Processing-Disorder.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTonZGn-PUsTFYu7PZsWPresE_NN949osYYg&s',
    'https://framerusercontent.com/images/LQc41UO3iOOXZHgKNz977DkRWvQ.webp?width=1200&height=650',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXlrrSERHQw_f2HoLPNWlgazgwUXtgz0vdLw&s',
];

function ImageGallery({ images }) {
    // Duplicate for seamless infinite scroll
    const doubled = [...images, ...images];
    return (
        <div className="image-gallery">
            <div className="image-gallery-track">
                {doubled.map((src, i) => (
                    <img key={i} src={src} alt="" loading="lazy" />
                ))}
            </div>
        </div>
    );
}

export default function Landing({ goToAuth }) {
    return (
        <>
            {/* ── Full-screen snow background (fixed) ── */}
            <div className="snow-background">
                <PixelSnow
                    color="#a8d0ff"
                    flakeSize={0.01}
                    minFlakeSize={1.25}
                    pixelResolution={200}
                    speed={1.25}
                    density={0.3}
                    direction={125}
                    brightness={1}
                    depthFade={8}
                    farPlane={20}
                    gamma={0.4545}
                    variant="square"
                    style={{ width: '100%', height: '100%' }}
                />
            </div>

            <div className="landing-page">
                {/* ── Navigation ── */}
                <header className="landing-header">
                    <h1>DDAP</h1>
                    <button id="login-btn" className="login-button" onClick={goToAuth}>
                        Login / Signup
                    </button>
                </header>

                {/* ── Hero Section ── */}
                <section className="hero-section">
                    <h2>Cognitive Disease<br />Awareness Platform</h2>
                    <p>
                        Understanding and supporting individuals with cognitive differences —
                        from Dyslexia to Dyscalculia and beyond.
                    </p>
                    <span className="scroll-hint">↓ Scroll to explore</span>
                </section>

                {/* ── Content Sections ── */}
                <main className="landing-content">
                    <div className="content-wrapper">

                        {/* Overview */}
                        <section className="content-section">
                            <h2>Cognitive Diseases</h2>
                            <p>
                                Cognitive diseases are disorders that affect a person's ability to think,
                                remember, learn, and make decisions. They primarily involve damage or
                                dysfunction in the brain, leading to a decline in mental abilities over time.
                                Common examples include Alzheimer's disease, dementia, Parkinson's disease,
                                and other neurodegenerative conditions. These diseases can result from factors
                                such as aging, genetic predisposition, brain injury, or underlying medical
                                conditions. While many cognitive diseases currently have no cure, early
                                diagnosis, proper treatment, and supportive care can help manage symptoms
                                and improve quality of life.
                            </p>
                        </section>

                        {/* Problem Statement */}
                        <section className="content-section">
                            <h2>About the Problem Statement</h2>
                            <p>
                                Our platform aims to bridge the gap between awareness and action for
                                individuals affected by cognitive learning disorders. By providing accessible
                                information, diagnostic insights, and community support, we empower patients,
                                caregivers, and educators to make informed decisions.
                            </p>
                        </section>

                        {/* Dyslexia */}
                        <section className="content-section">
                            <h2>Dyslexia</h2>
                            <p>
                                Dyslexia is a learning disorder that affects a person's ability to read,
                                spell, and process written language, even though their intelligence is
                                usually normal. It occurs due to differences in how the brain processes
                                language, making it difficult to recognize words and connect letters to
                                sounds. People with dyslexia may read slowly, confuse similar letters, or
                                struggle with spelling, but they often have strong creative and
                                problem-solving skills. With the right support, such as specialized teaching
                                methods and practice, individuals with dyslexia can improve their reading
                                abilities and succeed academically.
                            </p>
                            <ImageGallery images={dyslexiaImages} />
                        </section>

                        {/* Dyscalculia */}
                        <section className="content-section">
                            <h2>Dyscalculia</h2>
                            <p>
                                Dyscalculia is a learning disorder that affects a person's ability to
                                understand and work with numbers. It makes it difficult to grasp basic math
                                concepts such as counting, number recognition, and arithmetic. People with
                                dyscalculia may struggle with telling time, managing money, or solving math
                                problems, even if they are otherwise intelligent. This condition is not
                                related to intelligence or motivation, but rather to differences in how the
                                brain processes numerical information. With appropriate support, individuals
                                with dyscalculia can develop math skills and succeed in school and daily life.
                            </p>
                            <ImageGallery images={dyscalculiaImages} />
                        </section>

                        {/* ADP */}
                        <section className="content-section">
                            <h2>Auditory Processing Disorder</h2>
                            <p>Auditory Processing Disorder (APD) is a condition where the
                                brain has trouble processing the sounds it hears. It's not
                                a hearing problem the ears work fine but the brain
                                doesn't interpret the sounds correctly. This can make it hard
                                to understand speech, follow directions, or remember what was
                                heard, especially in noisy environments. APD can affect
                                people of all ages and may be linked to other conditions
                                like ADHD or autism. With the right support, such as speech
                                therapy or classroom accommodations, individuals with APD
                                can learn strategies to manage their challenges and succeed
                                in school and daily life.
                            </p>
                            <ImageGallery images={adpImages} />
                        </section>

                        {/* Footer */}
                        <footer className="footer-section">
                            <h3>Connect with us</h3>
                            <div className="social-links">
                                <a href="https://github.com/Tanish-2112" target="_blank" rel="noreferrer" id="github-link">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg"
                                        alt="GitHub"
                                    />
                                </a>
                                <a href="https://www.instagram.com/_heyy_sxmarth/#" target="_blank" rel="noreferrer" id="instagram-link">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/CIS-A2K_Instagram_Icon_%28Black%29.svg/960px-CIS-A2K_Instagram_Icon_%28Black%29.svg.png"
                                        alt="Instagram"
                                    />
                                </a>
                            </div>
                        </footer>

                    </div>
                </main>
            </div>
        </>
    );
}