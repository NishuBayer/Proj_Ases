from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

QUESTIONS = [
    {
        "id": 1,
        "text": "Connected Vehicles use case comes under which MEC service scenario?",
        "options": ["Consumer-oriented service", "Operator and third-party services", "Network performance and QoE improvements", "All of the above"],
        "marks": 1,
    },
    {
        "id": 2,
        "text": "The beam width of the antenna pattern measured at half power points is called?",
        "options": ["Half power beam width", "Full null beam width", "Beam width", "Side lobe width"],
        "marks": 1,
    },
    {
        "id": 3,
        "text": "Match the tools to the usages -",
        "options": ["Brand Watch", "Undo", "Data Management", "QlikView"],
        "marks": 1,
    },
    {
        "id": 4,
        "text": "Match the description to the types of cellular networks:\n\nA) Analog networks using AMPS\nB) Digital networks making use of GSM technology\nC) Network supporting LTE for fast moving mobiles\nD) Multimedia networks that are IMT - 2000 compliant\n\ni) 4G\nii) 3G\niii) 2G\niv) 1G\n\nSelect the correct matching sequence from the choices below.",
        "options": [
            "A) - iv    B) - iii    C) - i    D) - ii",
            "A) - ii    B) - i     C) - iii  D) - iv",
            "A) - iii   B) - i     C) - ii   D) - iv",
            "A) - i     B) - ii    C) - iii  D) - iv",
            "A) - iv    B) - ii    C) - i    D) - iii",
            "A) - iii   B) - iv    C) - ii   D) - i"
        ],
        "marks": 1,
    },
] + [
    {
        "id": i,
        "text": f"Select the most appropriate answer for assessment question {i}.",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "marks": 1,
    }
    for i in range(5, 31)
]

@app.route('/')
def instructions():
    return render_template('instructions.html')

@app.route('/group-instructions')
def group_instructions():
    return render_template('group_instructions.html')

@app.route('/assessment')
def assessment():
    return render_template('assessment.html', questions=QUESTIONS)

@app.route('/api/questions')
def get_questions():
    return jsonify(QUESTIONS)

@app.route('/api/submit', methods=['POST'])
def submit():
    data = request.get_json(silent=True) or {}
    answers = data.get('answers', {})
    return jsonify({"ok": True, "answered": len(answers), "message": "Assessment submitted successfully."})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
