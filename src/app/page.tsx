"use client";
import { useEffect, useState } from "react";

interface Definition {
	word: string;
	meanings: Array<{
		partOfSpeech: string;
		definitions: Array<{
			definition: string;
		}>;
	}>;
}

interface HistoryItem {
	word: string;
	timestamp: number;
}

export default function Home() {
	const [word, setWord] = useState<string>("");
	const [definition, setDefinition] = useState<Definition | null>(null);
	const [loading, setLoading] = useState(true);
	const [copied, setCopied] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const [history, setHistory] = useState<HistoryItem[]>([]);

	useEffect(() => {
		const fetchInitialData = async () => {
			setLoading(true);
			try {
				// Load history first
				const historyResponse = await fetch("/api/history");
				const savedHistory = await historyResponse.json();
				setHistory(savedHistory);

				// Then fetch word
				const wordResponse = await fetch("/api/words");
				const data = await wordResponse.json();
				setWord(data.word);
				setDefinition(data);

				// Update history with new word
				const timestamp = Date.now();
				const newHistory = [
					{ word: data.word, timestamp },
					...savedHistory,
				].slice(0, 10);
				await fetch("/api/history", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify([{ word: data.word, timestamp }]),
				});
				setHistory(newHistory);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchInitialData();
	}, []);

	const formatDefinitionText = () => {
		if (!definition) return "";

		let text = `"${word}"\n\n`;

		for (const meaning of definition.meanings) {
			text += `${meaning.partOfSpeech}:\n`;
			for (const def of meaning.definitions) {
				text += `${def.definition}\n`;
			}
			text += "\n";
		}

		return text;
	};

	const handleCopy = async () => {
		const text = formatDefinitionText();
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy text:", err);
		}
	};

	const buttonClasses =
		"rounded-full border border-solid border-white/20 transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 hover:bg-green-500 hover:text-white hover:border-transparent text-xs sm:text-base h-9 sm:h-12 px-3 sm:px-8 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md glass-effect whitespace-nowrap";

	return (
		<>
			<div className="grid grid-rows-[20px_1fr_auto] items-center justify-items-center min-h-screen p-4 sm:p-8 pb-20 gap-8 sm:gap-16 sm:p-20">
				{/* Logo */}
				<div className="fixed top-4 sm:top-6 left-4 sm:left-6 z-10">
					<h1 className="text-xl sm:text-2xl font-bold tracking-wider logo-container">
						<span className="text-gradient">Word</span>
						<span className="text-white/80">mark</span>
					</h1>
				</div>

				<main className="flex flex-col gap-6 sm:gap-8 row-start-2 items-center text-center w-full max-w-2xl animate-fadeIn">
					{loading ? (
						<div className="text-xl sm:text-2xl animate-pulse-slow">
							<i className="fas fa-spinner fa-spin text-3xl sm:text-4xl text-green-500" />
						</div>
					) : (
						<>
							<h1 className="text-2xl sm:text-4xl md:text-6xl font-bold capitalize flex flex-wrap items-center justify-center gap-2 sm:gap-4 animate-slideDown px-2">
								<i className="fas fa-quote-left text-green-400 animate-fadeIn text-xl sm:text-2xl md:text-3xl" />
								<span className="text-gradient word-underline break-all">
									{word}
								</span>
								<i className="fas fa-quote-right text-green-400 animate-fadeIn text-xl sm:text-2xl md:text-3xl" />
							</h1>
							{definition && definition.meanings.length > 0 ? (
								<div className="flex flex-col gap-4 animate-slideUp w-full">
									{definition.meanings.map((meaning, index) => (
										<div
											key={`${word}-${meaning.partOfSpeech}-${index}`}
											className="text-left glass-effect p-6 rounded-xl hover:shadow-lg transition-all duration-300"
										>
											<p className="text-sm text-gray-300 italic flex items-center gap-2">
												<i className="fas fa-book text-green-400" />
												{meaning.partOfSpeech}
											</p>
											<ul className="list-none">
												{meaning.definitions.map((def, idx) => (
													<li
														key={`${word}-${meaning.partOfSpeech}-${index}-${idx}`}
														className="text-lg mt-2 flex gap-3 hover:translate-x-1 transition-transform duration-200"
													>
														<i className="fas fa-angle-right text-green-400 mt-1.5" />
														<span className="text-gray-100">
															{def.definition}
														</span>
													</li>
												))}
											</ul>
										</div>
									))}
								</div>
							) : (
								<p className="text-lg text-gray-300 animate-pulse-slow">
									<i className="fas fa-exclamation-circle mr-2" />
									No definition found for this word.
								</p>
							)}
							<div className="flex flex-wrap justify-center gap-2 sm:gap-4 animate-slideUp w-full px-2">
								<button
									type="button"
									onClick={() => {
										setLoading(true);
										window.location.reload();
									}}
									className={buttonClasses}
								>
									<i className="fas fa-random" />
									<span>New Word</span>
								</button>
								<button
									type="button"
									onClick={handleCopy}
									className={buttonClasses}
								>
									<i className={`fas ${copied ? "fa-check" : "fa-save"}`} />
									<span>{copied ? "Copied!" : "Save"}</span>
								</button>
								<button
									type="button"
									onClick={() => setShowHistory(!showHistory)}
									className={buttonClasses}
								>
									<i className="fas fa-history" />
									<span>History</span>
								</button>
							</div>
						</>
					)}
				</main>
				<footer className="row-start-3 flex flex-col items-center justify-center gap-1 sm:gap-2 text-gray-400 text-xs sm:text-sm glass-effect p-3 sm:p-4 rounded-xl w-full max-w-2xl animate-fadeIn">
					<p className="text-center px-2">
						Generated word can take some moment to appear, due to the API
						limitations.
					</p>
					<p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-2 text-center">
						<span className="flex items-center gap-1">
							Made with{" "}
							<a
								href="https://nextjs.org"
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-green-500 transition-colors"
							>
								Next.js
							</a>
						</span>
						<span className="flex items-center gap-1">
							by{" "}
							<a
								href="https://github.com/idMJA"
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-green-500 transition-colors"
							>
								iaMJ
							</a>
						</span>
						<span className="hidden sm:inline">•</span>
						<a
							href="https://nwndev.github.io/wordmark"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-green-500 transition-colors flex items-center gap-1"
						>
							<i className="bi bi-arrow-90deg-right" />
							Originals
						</a>
						<span className="hidden sm:inline">•</span>
						<a
							href="https://github.com/idMJA/workmark"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-green-500 transition-colors flex items-center gap-1"
						>
							<i className="fas fa-code-branch" />
							Sources
						</a>
					</p>
				</footer>
			</div>

			{/* History Modal */}
			{showHistory && (
				<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
					<div className="glass-effect rounded-lg shadow-xl max-w-md w-full transform transition-all duration-300 animate-scaleUp">
						<div className="p-6">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-semibold flex items-center gap-2">
									<i className="fas fa-clock text-green-400 animate-spin-slow" />
									<span className="text-gradient">Last 10 Words</span>
								</h2>
								<button
									type="button"
									onClick={() => setShowHistory(false)}
									className="text-gray-400 hover:text-white transition-colors duration-200 hover:rotate-90 transform"
								>
									<i className="fas fa-times text-xl" />
								</button>
							</div>
							{history.length > 0 ? (
								<ul className="divide-y divide-gray-700">
									{history.map((item) => (
										<li
											key={item.timestamp}
											className="py-3 flex justify-between items-center hover:bg-white/5 px-2 rounded transition-colors duration-200"
										>
											<span className="font-medium text-gradient">
												{item.word}
											</span>
											<span className="text-sm text-gray-400">
												{new Date(item.timestamp).toLocaleTimeString()}
											</span>
										</li>
									))}
								</ul>
							) : (
								<p className="text-center text-gray-400 animate-pulse-slow">
									No history yet
								</p>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
