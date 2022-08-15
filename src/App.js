import './App.css';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams, Link } from "react-router-dom";

// const url = "http://127.0.0.1:5000"; // LOCAL URL
const url = "https://cospermitting.azurewebsites.net"; // PROD URL


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
    const [value, setValue] = useState("");
    let navigate = useNavigate();
    return (
        <div className='container'>
            <h2 className='border-bottom pt-5 pb-3'>Track permit status</h2>
            <p>Look up your project status using the <b>5-digit project number</b> or use the <b>project's address</b>
                to check on multiple permit statuses.</p>
            <div className='d-flex py-4'>
                <input className='p-2' placeholder='Example: 5-digit project number or project address' value={value}
                    onChange={(e) => setValue(e.target.value)} />
                <button
                    onClick={(e) => navigate(`/status/${value}`)}
                    className='ml-auto' >Search</button>
            </div>
            <button>Can't find the project number?</button>
            <div className='d-flex justify-content-center pt-5'>
                <p>Need help? Contact city staff</p>
            </div>
        </div>
    )
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

            : <div>loading</div>
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

        </div> : <div>loading</div>
    );
}

function Header() {
    const logo = "/img/syracuse-logo.png";

    return (
        <Navbar expand="lg" variant="dark" className='px-3 text-white' style={{ backgroundColor: '#1d2754' }}>
            <Link to="/" className='mx-2'>
                <img src={logo} height={30} alt="logo" />
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
