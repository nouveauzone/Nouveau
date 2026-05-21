import { useState, useEffect } from "react";
import NouveauLogo from "./Logo";
import { THEME } from "../styles/theme";
import { TrustWhatsApp, TrustEmail } from "./TrustIcons";
import { metricsService } from "../services/metricsService";

export default function Footer({ setPage }) {
	const [searchCount, setSearchCount] = useState(0);
	const [siteViewCount, setSiteViewCount] = useState(0);

	useEffect(() => {
		let isMounted = true;

		Promise.all([metricsService.getSearchCount(), metricsService.getSiteViews()]).then(([searches, views]) => {
			if (!isMounted) return;
			setSearchCount(searches);
			setSiteViewCount(views);
		});

		const handleSearch = (event) => {
			const query = event.detail?.query;
			if (query?.trim()) {
				metricsService.trackSearch(query).then(setSearchCount);
			}
		};

		window.addEventListener("nouveau:shop-search", handleSearch);
		return () => {
			isMounted = false;
			window.removeEventListener("nouveau:shop-search", handleSearch);
		};
	}, []);

	const quickLinks = [
		{ label: "Home", page: "Home" },
		{ label: "Shop", page: "Shop" },
		{ label: "Indian Ethnic Wear", page: "EthnicWear" },
		{ label: "Premium Western Wear", page: "WesternWear" },
		{ label: "About Us", page: "About" },
		{ label: "Contact", page: "Contact" },
	];

	const customerLinks = [
		{ label: "Size Guide", page: "SizeGuide" },
		{ label: "Shipping Information", page: "Shipping" },
		{ label: "Track Order", page: "TrackOrder" },
		{ label: "FAQ", page: "FAQ" },
	];

	const connectLinks = [
		{ label: "Instagram", href: "https://www.instagram.com/nouveauzon?igsh=aWc4bGltMGxkOWU2" },
		{ label: "Facebook", href: "https://www.facebook.com/share/19294L8VGF/?mibextid=wwXIfr" },
		{ label: "WhatsApp", href: "https://wa.me/917733881577" },
		{ label: "Email Us", href: "mailto:nouveauzone@gmail.com" },
	];

	const linkStyle = {
		color: "rgba(255,255,255,0.75)",
		fontSize: "13px",
		marginBottom: "6px",
		cursor: "pointer",
		fontFamily: "'Poppins',sans-serif",
		transition: "color 0.2s",
		display: "block",
		textDecoration: "none",
	};

	return (
		<footer style={{ background: THEME.crimson, padding: "42px 32px 24px", borderTop: `1px solid ${THEME.gold}55` }}>
			<div style={{ maxWidth: "1400px", margin: "0 auto" }}>
				<div style={{ textAlign: "center", marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
					<div style={{ display: "flex", justifyContent: "center" }}>
						<NouveauLogo size={40} />
					</div>
					<div style={{ fontFamily: "'Playfair Display',serif", fontSize: "22px", color: "#fff", letterSpacing: "3px", margin: "12px 0 4px" }}>
						nouveau<span style={{ color: "#C9A227" }}>™</span>
					</div>
					<p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "8px", letterSpacing: "5px", color: THEME.gold }}>Wear Your Aura</p>
				</div>

				<div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "28px", marginBottom: "28px" }} className="footer-grid">
					<div>
						<p className="footer-intro" style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", lineHeight: 1.65, fontFamily: "'Poppins',sans-serif", fontStyle: "italic" }}>
							Premium women's wear crafted for the modern Indian. Celebrating the finest ethnic traditions alongside contemporary elegance.
						</p>
						<div className="footer-social" style={{ marginTop: "14px" }}>
							{[
								[<TrustWhatsApp size={16} />, "WhatsApp", "https://wa.me/917733881577"],
								[<TrustEmail size={16} />, "Email", "mailto:nouveauzone@gmail.com"],
							].map(([Icon, label, href]) => (
								<a
									key={label}
									href={href}
									target="_blank"
									rel="noreferrer"
									style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.8)", fontSize: "12px", fontFamily: "'Poppins',sans-serif", marginRight: "18px", marginBottom: "6px", textDecoration: "none", borderBottom: "1px solid transparent", transition: "all 0.2s" }}
									onMouseEnter={(e) => {
										e.currentTarget.style.color = THEME.gold;
										e.currentTarget.style.borderBottomColor = THEME.gold;
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.color = "rgba(255,255,255,0.8)";
										e.currentTarget.style.borderBottomColor = "transparent";
									}}
								>
									{label}
								</a>
							))}
						</div>
					</div>

					<div>
						<p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "4px", color: THEME.gold, textTransform: "uppercase", marginBottom: "14px", fontWeight: 600 }}>Quick Links</p>
						{quickLinks.map(({ label, page }) => (
							<span
								key={label}
								onClick={() => setPage(page)}
								style={linkStyle}
								onMouseEnter={(e) => {
									e.target.style.color = THEME.gold;
								}}
								onMouseLeave={(e) => {
									e.target.style.color = "rgba(255,255,255,0.75)";
								}}
							>
								{label}
							</span>
						))}
					</div>

					<div>
						<p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "4px", color: THEME.gold, textTransform: "uppercase", marginBottom: "14px", fontWeight: 600 }}>Customer</p>
						{customerLinks.map(({ label, page }) => (
							<span
								key={label}
								onClick={() => setPage(page)}
								style={linkStyle}
								onMouseEnter={(e) => {
									e.target.style.color = THEME.gold;
								}}
								onMouseLeave={(e) => {
									e.target.style.color = "rgba(255,255,255,0.75)";
								}}
							>
								{label}
							</span>
						))}
					</div>

					<div>
						<p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "4px", color: THEME.gold, textTransform: "uppercase", marginBottom: "14px", fontWeight: 600 }}>Connect</p>
						{connectLinks.map(({ label, href }) => (
							<a
								key={label}
								href={href}
								target="_blank"
								rel="noreferrer"
								style={linkStyle}
								onMouseEnter={(e) => {
									e.currentTarget.style.color = THEME.gold;
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.color = "rgba(255,255,255,0.75)";
								}}
							>
								{label}
							</a>
						))}
					</div>
				</div>

				<div className="footer-bottom-row" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "16px", alignItems: "center" }}>
					<p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontFamily: "'Poppins',sans-serif", margin: 0, justifySelf: "start" }}>© 2026 Nouveau™. All rights reserved. Women's Wear Only.</p>
					<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", justifySelf: "center" }}>
						<span style={{ color: "rgba(255,255,255,0.65)", fontSize: "11px", fontFamily: "'Poppins',sans-serif", display: "inline-flex", alignItems: "center", gap: "4px" }}>
							<span style={{ color: THEME.gold }}>👁️</span>
<<<<<<< HEAD
							Site views (All Time) {siteViewCount.toLocaleString()}
=======
							Site views {siteViewCount.toLocaleString()}
>>>>>>> c48e986d247157165f933c9cfe76aa24622bf357
						</span>
						<span
							style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontFamily: "'Poppins',sans-serif", cursor: "pointer" }}
							onClick={() => setPage("Terms")}
							onMouseEnter={(e) => {
								e.target.style.color = "rgba(255,255,255,0.8)";
							}}
							onMouseLeave={(e) => {
								e.target.style.color = "rgba(255,255,255,0.4)";
							}}
						>
							Terms & Condition
						</span>
					</div>
					<span className="footer-made" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontFamily: "'Poppins',sans-serif", justifySelf: "end" }}>Made with ♥ in India</span>
				</div>
			</div>
		</footer>
	);
}
