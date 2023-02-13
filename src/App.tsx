import './App.css';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams, Link } from "react-router-dom";
import { Key } from 'react';

const url = "https://mypermit.syr.gov";

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
    status: string,
    department: string,
    reviewer: string,
    last_updated: string,
    comments: string
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
    const permitImg = "/img/permit_app_highlighted_Page_1.png";

    const [value, setValue] = useState<string>();
    const navigate = useNavigate();
    return (
        <div className='container'>
            <h2 className='border-bottom pt-5 pb-3 mb-5'>Track Your Permit Status</h2>
            <h5>Are you looking for the status of your permit application?</h5>
            <p></p>
            <p>To find the current status of your application please input the <b>Permit (or project)</b> number that is listed on your application into the search box below.</p>
            <div className="input-group mb-3">
                <input type="text" className="form-control" placeholder="Enter project (permit) number" aria-label="Recipient's username" aria-describedby="button-addon2"
                    value={value} onChange={(e) => setValue(e.target.value)}
                />
                <button style={{ backgroundColor: '#1d2754', color: 'white' }} onClick={(e) => navigate(`/status/${value}`)} className="btn btn-outline-secondary" type="button" id="button-addon2">
                    <img className='px-2' src={magGlass} height={20} alt="logo" />
                    Search
                </button>
            </div>
            <p>Can't find the project number? Please check the confirmation email your recieved from the permits department, or find the number on your permit application as highlighted below.</p>
            <div>
                <div><img src={permitImg} height={550} alt="Permit With Number Highlighted" /></div>
            </div>
            <div className='d-flex justify-content-center pt-3'>
                <img className='px-2 pt-1' src={chatBubble} height={20} alt="logo" />
                <p>Need additional help? <a href="https://www.syr.gov/Departments/Central-Permit-Office">Contact city staff</a></p>
            </div>
        </div>
    );
}

function PermitInfo() {
    const params = useParams();
    console.log(params.permitNumber);
    const [permitInfo, setPermitInfo] = useState<IPermitInfo>();
    const [notFound, setNotFound] = useState(false);
    const returnArrow = "/img/return-arrow-yellow.png";

    const navigate = useNavigate();
    console.log(permitInfo);

    useEffect(() => {
        fetch(`${url}/api/permit/${params.permitNumber}`)
            .then(res => res.json())
            .then(r => setPermitInfo(r))
            .catch(() => setNotFound(true));
    }, [params.permitNumber]);

    const getStatusColor = () => {
        if (permitInfo === undefined) {
            return "red";
        }
        const status = permitInfo.permit_status;
        if (['Not Applicable', 'Voided', 'Application Expired', 'Withdrawn', 'Denied', 'Cancelled'].includes(status)) {
            return "red";
        } else if (['Active', 'Ready for Issue'].includes(status)) {
            return "green";
        }
        return "orange";
    };

    return (
        permitInfo ?
            <div className='container'>
                <h2 className='border-bottom pt-4 pb-3'>
                    Your permit is <span style={{ color: getStatusColor() }}>{permitInfo.permit_status}</span>
                </h2>
                <p>The estimated approval date for this permit is <strong>{permitInfo.sla_projected_completion_date}</strong>. If you haven't gotten an update in a few weeks or have concerns about the timeline, please call <a href="tel:3154488600">315-448-8600</a>.</p>
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
                {notFound ?
                <div className='container text-center pt-4'>
                    <p>We are sorry, but status information relating to the permit number: <b>{params.permitNumber}</b> was not able to be located at this time</p>
                    <p>If you believe your permit should be avilable for status checking at this time, please: <a href="https://www.syr.gov/Departments/Central-Permit-Office">Contact city staff</a></p>
                    <p>Do note that it can take <b>up to 48 hours</b> after a permit application is submitted to appear in the status tracker.</p>
                    <button style={{ backgroundColor: '#1d2754', color: '#F1BE48' }} onClick={(e) => navigate(`/`)} className="btn btn-outline-secondary" type="button" id="button-addon2">
                    <img className='px-2' src={returnArrow} height={20} alt="return" />
                    Return to Main Page
                </button>
                </div>
                : 
                "Please wait while we attempt to locate information about the status of your permit."}
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
        } else if (status === "Conditionally Approved" || status === "Approved") {
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
                    <div className='text-end'>{props.departmentStatus.last_updated}</div>
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
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        fetch(`${url}/api/permit/${params.permitNumber}/department-status/${params.departmentId}`)
            .then(res => res.json())
            .then(r => setDepartmentInfo(r))
            .catch(() => setNotFound(true));
    }, [params.permitNumber, params.departmentId]);

    console.log(departmentInfo);

    return (departmentInfo ?
        <div className='container'>
            <h2 className='border-bottom pt-4 pb-3'>Plan is {departmentInfo.status} by {departmentInfo.department}</h2>
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
            <p>{departmentInfo.comments}</p>
        </div>
        :
        <div className='container text-center pt-4'>
            {notFound ? "not found" : "loading"}
        </div>
    );
}

function Header() {
    const logo = "/img/syracuse-logo.png";
    const yellowReturn = "/img/return-arrow-yellow.png"

    return (
        <Navbar expand="false" variant="dark" className='p-4 text-white' style={{ backgroundColor: '#1d2754' }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#F1BE48', fontSize: '2.0em' }}>
                <img className='pe-2' src={logo} height={45} alt="logo" style={{ color: '#1d2754' }}/>
                Where's My Permit?
            </Link>
            {/* <Nav className="ml-auto">
                <a href="https://app.oncamino.com/syracuseny/login" className='text-decoration-none text-reset'>
                    <div className="d-flex">
                        <img className='pe-2' src={personIcon} height={20} alt="logo" />
                        Sign In
                    </div>
                </a>
            </Nav> */}
            <Nav className="ml-auto">
                <Link to="https://www.syr.gov/Departments/Central-Permit-Office" className='text-decoration-none text-reset'>
                    <div className="d-flex" style={{ textDecoration: 'none', color: '#F1BE48', fontSize: '1.2em' }}>
                        <img src={yellowReturn} className='pe-2' height={25} alt=""/>
                        Return to syr.gov/permits
                    </div>
                </Link>
            </Nav>
        </Navbar>
    );
}

export default App;
