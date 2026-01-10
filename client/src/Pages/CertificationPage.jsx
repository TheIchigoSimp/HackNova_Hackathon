import React, { useState } from 'react';
import { getCertifications } from '../api/certificationApi';
import { showErrorToast, showSuccessToast } from "../../utils/toastUtils";
import { FaGlobe, FaCertificate, FaGraduationCap, FaSpinner } from 'react-icons/fa';
import SlideButton from "../components/Buttons/SlideButton";
import { MdExplore } from "react-icons/md";

const CertificationPage = () => {
    const [domain, setDomain] = useState('');
    const [experience, setExperience] = useState('Beginner');
    const [skills, setSkills] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResults(null);

        try {
            const data = await getCertifications({ domain, experience, skills });
            setResults(data);
            showSuccessToast("Certifications fetched successfully!");
        } catch (error) {
            console.error("Error fetching certifications:", error);
            showErrorToast("Failed to fetch certifications. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-26 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-10 md:mb-16">
                <h1 className="text-xl md:text-4xl font-bold text-white mb-4 leading-tight tracking-tight">
                    <span className="bg-white bg-clip-text text-transparent drop-shadow-lg">
                        AI Certification Engine
                    </span>
                </h1>
                <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
                    Find the perfect industry-aligned certifications to boost your career.
                </p>
            </div>

            {/* Input Form */}
            <div className="bg-[#1e1e2e]/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl max-w-3xl mx-auto mb-20 relative overflow-hidden ring-1 ring-white/5">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-slate-300 mb-2 font-medium text-sm md:text-base tracking-wide">Domain</label>
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="e.g. Cloud Computing, Data Science"
                            className="w-full bg-[#13131a] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-slate-300 mb-2 font-medium text-sm md:text-base tracking-wide">Experience Level</label>
                            <div className="relative">
                                <select
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="w-full bg-[#13131a] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none shadow-inner"
                                >
                                    <option value="Beginner">Beginner (0-2 years)</option>
                                    <option value="Intermediate">Intermediate (2-5 years)</option>
                                    <option value="Advanced">Advanced (5+ years)</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-300 mb-2 font-medium text-sm md:text-base tracking-wide">Existing Skills (Optional)</label>
                            <input
                                type="text"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                placeholder="e.g. Python, SQL"
                                className="w-full bg-[#13131a] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center pt-5">
                        <SlideButton
                            text={loading ? "Analyzing..." : "Discover Certifications"}
                            icon={loading ? <FaSpinner className="animate-spin" /> : null}
                            disabled={loading}
                            fullWidth={false}
                            onClick={handleSubmit}
                            style={{ minWidth: '240px', height: '50px' }}
                        />
                    </div>
                </form>
            </div>

            {/* Results Section */}
            {results && results.recommendations && (
                <div className="space-y-24 pb-20">
                    <Section
                        title="Globally Recognized"
                        subtitle="Gold Standard Verification"
                        icon={<FaGlobe className="text-amber-500" />}
                        data={results.recommendations.globally_recognized_paid}
                        theme="gold"
                    />
                    <Section
                        title="Free & Open Source"
                        subtitle="High Value, Zero Cost"
                        icon={<FaCertificate className="text-cyan-400" />}
                        data={results.recommendations.free_certifications}
                        theme="cyan"
                    />
                    <Section
                        title="Professional Growth"
                        subtitle="Skill Specialization"
                        icon={<FaGraduationCap className="text-fuchsia-400" />}
                        data={results.recommendations.normal_certifications}
                        theme="fuchsia"
                    />
                </div>
            )}
        </div>
    );
};

const Section = ({ title, subtitle, icon, data, theme }) => {
    if (!data || data.length === 0) return null;

    const themes = {
        gold: {
            title: "text-amber-100",
            subtitle: "text-amber-400/80",
            cardBg: "bg-[#181820]/80",
            border: "border-amber-500/20",
            badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
            hoverBorder: "group-hover:border-amber-500/40",
            button: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-900/30",
            highlight: "text-amber-200"
        },
        cyan: {
            title: "text-cyan-100",
            subtitle: "text-cyan-400/80",
            cardBg: "bg-[#161b22]/80",
            border: "border-cyan-500/20",
            badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
            hoverBorder: "group-hover:border-cyan-500/40",
            button: "bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-lg shadow-cyan-900/30",
            highlight: "text-cyan-200"
        },
        fuchsia: {
            title: "text-fuchsia-100",
            subtitle: "text-fuchsia-400/80",
            cardBg: "bg-[#1a1622]/80",
            border: "border-fuchsia-500/20",
            badge: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20",
            hoverBorder: "group-hover:border-fuchsia-500/40",
            button: "bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white shadow-lg shadow-fuchsia-900/30",
            highlight: "text-fuchsia-200"
        },
    };

    const t = themes[theme];

    return (
        <div className="animate-fade-in-up">
            <div className="flex items-center gap-4 mb-10 px-2 border-b border-white/5 pb-4">
                <span className="text-3xl filter drop-shadow-md">{icon}</span>
                <div>
                    <h2 className={`text-2xl font-bold ${t.title} tracking-tight`}>{title}</h2>
                    <p className={`text-sm font-medium uppercase tracking-widest ${t.subtitle}`}>{subtitle}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.map((cert, index) => (
                    <div key={index} className={`flex flex-col p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent p-[1px] group transition-transform duration-300 hover:-translate-y-2`}>
                        <div className={`flex flex-col h-full p-6 rounded-2xl ${t.cardBg} backdrop-blur-md border ${t.border} ${t.hoverBorder} transition-colors duration-300 relative overflow-hidden`}>

                            {/* Top glow */}
                            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-white/5 blur-3xl rounded-full transition-opacity duration-500 group-hover:opacity-100 opacity-50 pointer-events-none`}></div>

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <span className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full border ${t.badge}`}>
                                    {cert.difficulty}
                                </span>
                                <span className="text-xs text-slate-400 bg-black/20 px-2.5 py-1 rounded-lg font-medium border border-white/5">{cert.mode}</span>
                            </div>

                            <h3 className={`text-xl font-bold text-white mb-3 leading-snug min-h-[3.5rem] tracking-tight`}>
                                {cert.name}
                            </h3>
                            <p className="text-slate-400 text-sm mb-6 font-medium tracking-wide">{cert.organization}</p>

                            <div className="mt-auto space-y-4 relative z-10">
                                <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Cost</span>
                                        <span className={`font-bold ${t.highlight}`}>{cert.pricing}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-t border-white/5 pt-2">
                                        <span className="text-slate-500 font-medium">Best For</span>
                                        <span className="text-slate-300 font-medium text-right truncate ml-2 max-w-[120px]">{cert.ideal_for}</span>
                                    </div>
                                </div>

                                <a
                                    href={cert.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`block w-full text-center py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95 ${t.button}`}
                                >
                                    View Details
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CertificationPage;
