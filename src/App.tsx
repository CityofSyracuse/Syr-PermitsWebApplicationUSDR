import './App.css';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams, Link } from "react-router-dom";
import { Key } from 'react';

const url = process.env.REACT_APP_SYR_DEV_ENV === "dev" ? "http://127.0.0.1:5000" : "https://cospermitting.azurewebsites.net";

interface IPermitInfo {
    number: string,
    submitted_by: string,
    permit_type: string,
    permit_status: string,
    address: string,
    description: string,
    sla_projected_completion_date: string,
    department_statuses: IDepartmentStatus[]
}

interface IDepartmentStatus {
    id: string,
    department: string,
    status: string,
    last_updated: string,
}

interface IDepartmentInfo {
    title: string,
    reviewer: string,
    last_updated: string,
    notes: string[]
}

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<OtherPermitSearch />} />
                <Route path="/status/:permitNumber" element={<PermitInfo />} />
                <Route path="/status/:permitNumber/department/:departmentId" element={<DepartmentInfo />} />
            </Routes>
        </Router>
    );
}

function OtherPermitSearch() {
    const chatBubble = "/img/bubble.svg";
    const magGlass = "/img/mag-glass.svg";

    const [value, setValue] = useState<string>();
    const navigate = useNavigate();
    return (
        <div className='container'>
            <h2 className='border-bottom pt-5 pb-3 mb-5'>Track permit status</h2>
            <p>To look up your project status, use the <b>5-digit project number</b> provided after submitting the permit application.</p>
            <div className="input-group mb-3">
                <input type="text" className="form-control" placeholder="Enter 5-digit project number" aria-label="Recipient's username" aria-describedby="button-addon2"
                    value={value} onChange={(e) => setValue(e.target.value)}
                />
                <button style={{ backgroundColor: '#1d2754', color: 'white' }} onClick={(e) => navigate(`/status/${value}`)} className="btn btn-outline-secondary" type="button" id="button-addon2">
                    <img className='px-2' src={magGlass} height={20} alt="logo" />
                    Search
                </button>
            </div>
            <p>Can't find the project number? Please check the confirmation email or contact the city Staff.</p>
            <div className='d-flex justify-content-center pt-3'>
                <img className='px-2 pt-1' src={chatBubble} height={20} alt="logo" />
                <p>Need help? Contact city staff</p>
            </div>
        </div>
    );
}

function PermitInfo() {
    const params = useParams();
    console.log(params.permitNumber);
    const [permitInfo, setPermitInfo] = useState<IPermitInfo>();
    const [notFound, setNotFound] = useState(false);
    console.log(permitInfo);

    useEffect(() => {
        fetch(`${url}/api/permit/${params.permitNumber}`)
            .then(res => res.json())
            .then(r => setPermitInfo(r))
            .catch(() => setNotFound(true));
    }, [params.permitNumber]);

    return (
        permitInfo ?
            <div className='container'>
                <h2 className='border-bottom pt-4 pb-3'>
                    Your permit is <span style={{ color: 'orange' }}>{permitInfo.permit_status}</span>
                </h2>
                <p>The estimated approval time for this permit is <strong>{permitInfo.sla_projected_completion_date}</strong>. If you haven't gotten an update in a few weeks or have concerns about the timeline, please call xxx-xxx-xxxx.</p>
                <table className='table'>
                    <tbody>
                        <tr>
                            <td>Permit number</td>
                            <td>{permitInfo.number}</td>
                        </tr>
                        <tr className='table-warning'>
                            <td>Submitted by</td>
                            <td>{permitInfo.submitted_by}</td>
                        </tr>
                        <tr>
                            <td>Permit type</td>
                            <td>{permitInfo.permit_type}</td>
                        </tr>
                        <tr className='table-warning'>
                            <td>Address / Area</td>
                            <td>{permitInfo.address}</td>
                        </tr>
                    </tbody>
                </table>
                <p className='fw-bold mb-0'>Description of work</p>
                <p className='border-bottom pb-3'>{permitInfo.description}</p>

                <h3>Department status</h3>
                {permitInfo.department_statuses.map(departmentStatus =>
                    <DepartmentTile key={departmentStatus.id as Key} departmentStatus={departmentStatus} />
                )}
            </div>
            :
            <div className='container text-center pt-4'>
                {notFound ? "not found" : "loading"}
            </div>
    );
}

function DepartmentTile(props: { departmentStatus: IDepartmentStatus }) {
    const navigate = useNavigate();
    const rightArrow = "/img/right-arrow.svg"

    const generateStatusIcon = () => {
        const status = props.departmentStatus.status;
        if (status === "Pending") {
            return "/img/pending-time.svg";
        } else if (status === "Conditionally approved") {
            return "/img/green-check.svg";
        }
        return "/img/red-bang.svg";
    }


    return (
        <div style={{ cursor: 'pointer', maxWidth: '500px' }} className='border p-3 rounded m-2 d-flex justify-content-between'
            onClick={() => navigate(`department/${props.departmentStatus.id}`)}>
            <div className='d-flex justify-content-between'>
                <div>
                    <img className='px-2' src={generateStatusIcon()} height={15} alt="logo" />
                </div>
                <div>
                    <div>{props.departmentStatus.department}</div>
                    <div>Last updated</div>
                </div>
            </div>
            <div className='d-flex justify-content-between'>
                <div>
                    <div className='text-end'>{props.departmentStatus.status}</div>
                    <div>{props.departmentStatus.last_updated}</div>
                </div>
                <div className='d-flex align-items-center px-2'>
                    <img className='px-2' src={rightArrow} height={10} alt="logo" />
                </div>
            </div>
        </div>
    )
}

function DepartmentInfo() {
    const params = useParams();
    const [departmentInfo, setDepartmentInfo] = useState<IDepartmentInfo>();

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
    const personIcon = "/img/person-icon.svg";

    return (
        <Navbar expand="false" variant="dark" className='p-4 text-white' style={{ backgroundColor: '#1d2754' }}>
            <Link to="/" className='mx-2' style={{ textDecoration: 'none', color: 'white' }}>
                <img className='px-2' src={logo} height={30} alt="logo" />
                Track Permit Status
            </Link>
            <Nav className="ml-auto">
                <div className="d-flex">
                    <img className='px-2' src={personIcon} height={20} alt="logo" />
                    Sign In
                </div>
            </Nav>
        </Navbar>
    );
}

export default App;
