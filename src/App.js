import './App.css';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams, Link } from "react-router-dom";

const url = "http://127.0.0.1:5000"; // LOCAL URL
// const url = "https://cospermitting.azurewebsites.net"; // PROD URL


function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" exact element={<OtherPermitSearch />} />
                <Route path="/status/:permitNumber" element={<PermitInfo />} />
                <Route path="/status/:permitNumber/department/:departmentId" element={<DepartmentInfo />} />
            </Routes>
        </Router>
    );
}

function OtherPermitSearch() {
    const chatBubble = "/img/bubble.svg";
    const magGlass = "/img/mag-glass.svg";

    const [value, setValue] = useState("");
    let navigate = useNavigate();
    return (
        <div className='container'>
            <h2 className='border-bottom pt-5 pb-3 mb-5'>Track permit status</h2>
            <p>To look up your project status, use the <b>5-digit project number</b> provided after submitting the permit application.</p>
            <div className="input-group mb-3">
                <input type="text" className="form-control" placeholder="Enter 5-digit project number" aria-label="Recipient's username" aria-describedby="button-addon2"
                    value={value} onChange={(e) => setValue(e.target.value)}
                />
                <button onClick={(e) => navigate(`/status/${value}`)} className="btn btn-outline-secondary" type="button" id="button-addon2">
                    <img className='px-2' src={magGlass} height={20} alt="logo" />Search
                </button>
            </div>
            <p>Can’t find the project number? Please check the confirmation email or contact the city Staff.</p>
            <div className='d-flex justify-content-center pt-3'>
                <img className='px-2 pt-1' src={chatBubble} height={20} alt="logo" />
                <p>Need help? Contact city staff</p>
            </div>
        </div>
    );
}

function PermitInfo() {
    let params = useParams();
    console.log(params.permitNumber);
    const [permitInfo, setPermitInfo] = useState(null);
    console.log(permitInfo);

    useEffect(() => {
        fetch(`${url}/api/permit/${params.permitNumber}`)
            .then(res => res.json())
            .then(r => setPermitInfo(r))
            .catch(() => console.log("not found"));
    }, [params.permitNumber]);

    const calculateOverallStatus = () => "pending";

    return (
        permitInfo ?
            <div className='container'>
                <h2 className='border-bottom pt-5 pb-3'>Your permit is <span style={{ color: 'orange' }}>{calculateOverallStatus()}</span></h2>
                <p>The estimated approval time for this permit is <strong>MM/DD/YYYY</strong>. If you haven't gotten an update in a few weeks or have concerns about the timeline, please call xxx-xxx-xxxx.</p>
                <table className='table table-striped'>
                    <tbody>
                        <tr>
                            <td>Permit number</td>
                            <td>{permitInfo.number}</td>
                        </tr>
                        <tr>
                            <td>submitted by</td>
                            <td>{permitInfo.submitted_by}</td>
                        </tr>
                        <tr>
                            <td>Permit type</td>
                            <td>{permitInfo.permit_type}</td>
                        </tr>
                        <tr>
                            <td>Address / Area</td>
                            <td>{permitInfo.address}</td>
                        </tr>
                    </tbody>
                </table>
                <p className='fw-bold mb-0'>Description of work</p>
                <p className='border-bottom pb-3'>{permitInfo.description}</p>

                <h3>Department status</h3>
                {permitInfo.department_statuses.map(departmentStatus =>
                    <DepartmentTile key={departmentStatus.id} departmentStatus={departmentStatus} />
                )}
            </div>
            :
            <div>loading</div>
    );
}

function DepartmentTile({ departmentStatus }) {
    let navigate = useNavigate();

    return (
        <div style={{ cursor: 'pointer' }} className='border p-3 rounded m-2' onClick={() => navigate(`department/${departmentStatus.id}`)}>
            <div className='d-flex justify-content-between'>
                <div>{departmentStatus.department}</div>
                <div>Last updated</div>
            </div>
            <div className='d-flex justify-content-between'>
                <div>{departmentStatus.status}</div>
                <div>{departmentStatus.last_updated}</div>
            </div>
        </div>
    )
}

function DepartmentInfo() {
    let params = useParams();
    const [departmentInfo, setDepartmentInfo] = useState(null);

    useEffect(() => {
        fetch(`${url}/api/permit/${params.permitNumber}/department-status/${params.departmentId}`)
            .then(res => res.json())
            .then(r => setDepartmentInfo(r))
            .catch(() => console.log("not found"));
    }, [params.permitNumber, params.departmentId]);

    console.log(departmentInfo);

    return (departmentInfo ?
        <div className='container'>
            <h2 className='border-bottom pt-5 pb-3'>{departmentInfo.title} </h2>
            <table className='table table-striped'>
                <tbody>
                    <tr>
                        <td>Reviewer</td>
                        <td>{departmentInfo.reviewer}</td>
                    </tr>
                    <tr>
                        <td>Last updated</td>
                        <td>{departmentInfo.last_updated}</td>
                    </tr>
                </tbody>
            </table>
            <p className="fw-bold">Reason for hold</p>
            <ul>
                {departmentInfo.notes.map((info, i) =>
                    <li key={i}>{info}</li>
                )}
            </ul>

        </div>
        :
        <div>loading</div>
    );
}

function Header() {
    const logo = "/img/syracuse-logo.png";

    return (
        <Navbar expand="lg" variant="dark" className='px-3 text-white' style={{ backgroundColor: '#1d2754' }}>
            <Link to="/" className='mx-2' style={{ textDecoration: 'none', color: 'white' }}>
                <img className='px-2' src={logo} height={30} alt="logo" />
                Track Permit Status
            </Link>
            <Nav className="ml-auto">
                <div className="d-flex">
                    Sign In
                </div>
            </Nav>
        </Navbar>
    );
}

export default App;
