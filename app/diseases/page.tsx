import Link from "next/link";

const DISEASES = [
  {
    name: "Bacterial Spot",
    key: "Bacterial_spot",
    severity: "High",
    description: "A bacterial infection causing dark, water-soaked spots on leaves, stems and fruit. Spreads rapidly in warm, wet conditions.",
    symptoms: "Small, dark brown spots with yellow halos on leaves. Spots may merge causing leaf drop. Fruit shows raised, scab-like lesions.",
    treatment: "Apply copper-based bactericides. Remove and destroy infected plant material. Avoid overhead irrigation.",
    prevention: "Use certified disease-free seeds. Rotate crops every 2-3 years. Maintain proper plant spacing for airflow.",
  },
  {
    name: "Early Blight",
    key: "Early_blight",
    severity: "Medium",
    description: "A fungal disease caused by Alternaria solani, affecting older leaves first then spreading upward through the plant.",
    symptoms: "Dark brown spots with concentric rings forming a target-like pattern. Yellow tissue surrounds spots. Lower leaves affected first.",
    treatment: "Apply chlorothalonil or mancozeb fungicide. Remove infected leaves. Ensure adequate plant nutrition.",
    prevention: "Mulch around plants. Avoid wetting foliage. Practice crop rotation. Plant resistant varieties.",
  },
  {
    name: "Late Blight",
    key: "Late_blight",
    severity: "Critical",
    description: "Caused by Phytophthora infestans — the same pathogen responsible for the Irish potato famine. Can destroy crops within days.",
    symptoms: "Large, irregular grey-green water-soaked lesions. White mould on leaf undersides in humid conditions. Rapid plant collapse.",
    treatment: "Apply metalaxyl or cymoxanil immediately. Remove and bag infected plants. Do not compost infected material.",
    prevention: "Avoid overhead irrigation. Plant in well-drained soil. Monitor weather forecasts for blight risk days.",
  },
  {
    name: "Leaf Mold",
    key: "Leaf_Mold",
    severity: "Medium",
    description: "A fungal disease thriving in high humidity greenhouse environments, caused by Passalora fulva.",
    symptoms: "Pale green to yellow spots on upper leaf surface. Olive-green to brown velvety mould on lower surface.",
    treatment: "Improve ventilation. Apply fungicides containing chlorothalonil. Remove severely infected leaves.",
    prevention: "Reduce humidity below 85%. Increase air circulation. Avoid leaf wetness. Use resistant varieties.",
  },
  {
    name: "Septoria Leaf Spot",
    key: "Septoria_leaf_spot",
    severity: "Medium",
    description: "One of the most common and damaging tomato diseases, caused by the fungus Septoria lycopersici.",
    symptoms: "Small, circular spots with dark borders and light grey centres. Tiny black dots visible in spot centres.",
    treatment: "Apply copper fungicide or chlorothalonil. Remove lower infected leaves. Stake plants for better airflow.",
    prevention: "Avoid overhead watering. Mulch soil surface. Practice 3-year crop rotation.",
  },
  {
    name: "Spider Mites",
    key: "Spider_mites",
    severity: "Medium",
    description: "Tiny arachnids, not insects, that feed on plant cells. Thrive in hot, dry conditions and reproduce rapidly.",
    symptoms: "Fine webbing on leaf undersides. Tiny yellow or white stippling on leaves. Leaves turn bronze and drop.",
    treatment: "Apply miticide or insecticidal soap. Spray water forcefully on undersides of leaves. Introduce predatory mites.",
    prevention: "Maintain adequate soil moisture. Avoid dusty conditions. Monitor plants regularly in hot weather.",
  },
  {
    name: "Target Spot",
    key: "Target_Spot",
    severity: "Medium",
    description: "Caused by the fungus Corynespora cassiicola, affecting leaves, stems and fruit in warm humid climates.",
    symptoms: "Circular brown lesions with concentric rings. Lesions may have yellow margins. Affected leaves drop prematurely.",
    treatment: "Apply azoxystrobin or chlorothalonil. Remove infected leaves. Avoid high humidity around plants.",
    prevention: "Ensure good air circulation. Avoid overhead irrigation. Practice crop rotation.",
  },
  {
    name: "Yellow Leaf Curl Virus",
    key: "Tomato_Yellow_Leaf_Curl_Virus",
    severity: "Critical",
    description: "A viral disease transmitted by whiteflies that causes severe yield loss. No cure exists once infected.",
    symptoms: "Upward curling and yellowing of leaves. Stunted growth. Flower drop and poor fruit set.",
    treatment: "No cure. Remove and destroy infected plants immediately to prevent spread. Control whitefly populations.",
    prevention: "Use whitefly-resistant varieties. Install insect-proof nets. Apply reflective mulch. Use yellow sticky traps.",
  },
  {
    name: "Mosaic Virus",
    key: "Tomato_mosaic_virus",
    severity: "High",
    description: "A highly contagious viral disease spread by contact, tools and hands. Can persist in soil for years.",
    symptoms: "Mottled light and dark green mosaic pattern on leaves. Leaf distortion and curling. Stunted plant growth.",
    treatment: "No cure. Remove infected plants. Disinfect all tools with bleach solution after use.",
    prevention: "Wash hands before handling plants. Disinfect tools regularly. Do not smoke near plants — tobacco carries the virus.",
  },
  {
    name: "Healthy",
    key: "Healthy",
    severity: "None",
    description: "The leaf shows no signs of disease, pest damage or nutrient deficiency. The plant is in good condition.",
    symptoms: "Deep green uniform colour. No spots, lesions or abnormal patterns. Normal leaf shape and texture.",
    treatment: "No treatment needed. Continue regular watering, feeding and monitoring.",
    prevention: "Maintain good cultural practices — proper spacing, watering, fertilisation and crop rotation.",
  },
];

const severityColor: Record<string, string> = {
  Critical: "bg-red-50 text-red-700 border-red-100",
  High:     "bg-orange-50 text-orange-700 border-orange-100",
  Medium:   "bg-yellow-50 text-yellow-700 border-yellow-100",
  None:     "bg-green-50 text-green-700 border-green-100",
};

export default function DiseasesPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0]">

      {/* Nav */}
      <nav className="px-10 py-5 flex items-center justify-between border-b border-gray-200 bg-white">
        <Link href="/" className="font-bold text-gray-900 text-lg">
          Tomato<span className="text-green-700">AI</span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/diseases" className="text-gray-900 font-medium">Disease Library</Link>
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition">Dashboard</Link>
          <Link href="/" className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition text-xs font-semibold">
            New Scan
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-10 py-14">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-green-700 font-medium mb-3">Reference</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Disease Library</h1>
          <p className="text-gray-500 max-w-xl leading-relaxed">
            A complete guide to the 10 conditions this model can detect.
            Each entry includes symptoms, treatment and prevention advice.
          </p>
        </div>

        {/* Severity legend */}
        <div className="flex flex-wrap gap-3 mb-10">
          {Object.entries(severityColor).map(([level, cls]) => (
            <span key={level} className={`text-xs px-3 py-1 rounded-full border font-medium ${cls}`}>
              {level === "None" ? "Healthy" : level}
            </span>
          ))}
        </div>

        {/* Disease cards */}
        <div className="space-y-4">
          {DISEASES.map((disease) => (
            <details key={disease.key} className="bg-white rounded-2xl border border-gray-100 group">
              <summary className="px-8 py-6 cursor-pointer flex items-center justify-between list-none">
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium flex-shrink-0 ${severityColor[disease.severity]}`}>
                    {disease.severity === "None" ? "Healthy" : disease.severity}
                  </span>
                  <h2 className="text-gray-900 font-semibold">{disease.name}</h2>
                </div>
                <svg
                  className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180 flex-shrink-0"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>

              <div className="px-8 pb-8 border-t border-gray-50 pt-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{disease.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Symptoms",    value: disease.symptoms    },
                    { label: "Treatment",   value: disease.treatment   },
                    { label: "Prevention",  value: disease.prevention  },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2">{item.label}</p>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>

      <footer className="border-t border-gray-200 px-10 py-6 mt-10 text-center">
        <p className="text-gray-300 text-xs">TomatoAI · Built with Next.js, TensorFlow and FastAPI</p>
      </footer>
    </div>
  );
}