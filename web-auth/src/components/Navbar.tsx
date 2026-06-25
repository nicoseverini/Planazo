import logo from "../../public/icon_white.png";

export function Navbar() {
	const handleLogout = () => {
		sessionStorage.removeItem("accessToken");
		window.location.href = "/login";
	};

	return (
		<nav className="navbar">
			<div className="navbar-brand">
				<a href="/plans" className="navbar-logo">
					<img src={logo} alt="" />
				</a>
			</div>

			<ul className="navbar-nav">
				<li className="nav-item">
					<a href="/plans" className="nav-link">Plans</a>
				</li>
				<li className="nav-item">
					<a href="/tourist-places" className="nav-link">Tourist Places</a>
				</li>
				<li className="nav-item">
					<a href="/reports" className="nav-link">Reports</a>
				</li>
				<li className="nav-item">
					<button className="nav-link nav-link--logout" onClick={handleLogout}>
						Log out
					</button>
				</li>
			</ul>
		</nav>
	);
}