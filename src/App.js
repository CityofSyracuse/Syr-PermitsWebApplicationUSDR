import './App.css';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';


function App() {
    return (
        <div>
            <Header />
            <div className='container'>
                <h2 className='border-bottom pt-5 pb-3'>Track permit status</h2>
                <p>Look up your project status using the <b>5-digit project number</b> or use the <b>project's address</b> to check on multiple permit statuses.</p>
                <div className='d-flex py-4'>
                    <input className='p-2' placeholder='Example: 5-digit project number or project address'></input>
                    <button className='ml-auto' >Search</button>
                </div>
                <a href='#'>Can't find the project number?</a>
                <div className='d-flex justify-content-center pt-5'>
                    <p>Need help? Contact city staff</p>
                </div>
            </div>
        </div>
    );
}

function Header() {
    const logo = "/img/syracuse-logo.png";

    return (
        <Navbar expand="lg" variant="dark" className='px-3 text-white' style={{ backgroundColor: '#1d2754' }}>
            <Navbar.Brand href="#home">
                <img src={logo} height={30} alt="logo" />
            </Navbar.Brand>
            <Nav className="ml-auto">
                <div className="d-flex">
                    Sign In
                </div>
            </Nav>
        </Navbar>
    );
}

export default App;
