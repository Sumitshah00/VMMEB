// List of allowed CAPTCHAs
const captchas = [
    'X7T4Q', 'A9B5K', 'P3R6M', 'L8V2Z', 'Y5D9N', 'M2X7F',
    'C4J8R', 'W6P3T', 'Q9R5L', 'T1Z7D', 'F3K9P', 'R8V2G',
    'S4W1X', 'H2N6Q', 'G5P8Y', 'Z7M4J', 'B1T6V', 'N3F9R',
    'J8L2W', 'D5Q3Y'
];

let currentCaptcha = '';

function getRandomCaptcha() {
    return captchas[Math.floor(Math.random() * captchas.length)];
}

function setCaptcha() {
    currentCaptcha = getRandomCaptcha();
    document.getElementById('captchaText').textContent = currentCaptcha;
}

function getRandomRollNumber() {
    let roll = '';
    for (let i = 0; i < 12; i++) roll += Math.floor(Math.random() * 10);
    return roll;
}

function getRandomMarks() {
    // Theory: 0-80, Practical: 0-20
    return {
        theory: Math.floor(Math.random() * 81),
        practical: Math.floor(Math.random() * 21)
    };
}

function getGrade(total) {
    if (total >= 91) return 'A1';
    if (total >= 81) return 'A2';
    if (total >= 71) return 'B1';
    if (total >= 61) return 'B2';
    if (total >= 51) return 'C1';
    if (total >= 41) return 'C2';
    if (total >= 33) return 'D';
    return 'E';
}

function getResultStatus(subjects, percentage) {
    // Count failed subjects (total < 33)
    let failed = subjects.filter(s => s.total < 33).length;
    if (percentage > 75 && failed <= 2) {
        return { status: 'PASS', remark: 'Congratulations! You have passed.' };
    } else if (failed === 3) {
        return { status: 'COMPARTMENT', remark: 'Eligible for compartment exam.' };
    } else {
        return { status: 'FAIL', remark: 'Better luck next time.' };
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setCaptcha();

    document.getElementById('refreshCaptcha').addEventListener('click', function() {
        setCaptcha();
    });

    document.getElementById('resultForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const entered = document.getElementById('captcha').value.trim().toUpperCase();
        const name = document.getElementById('fullName').value.trim();
        const dob = document.getElementById('dob').value.trim();
        if (entered !== currentCaptcha) {
            alert('Incorrect CAPTCHA. Please try again.');
            setCaptcha();
            document.getElementById('captcha').value = '';
            return;
        }
        // Generate result data
        const roll = getRandomRollNumber();
        const admit = 'ADM' + Math.floor(Math.random() * 1000000000);
        // Subjects
        const subjects = [
            { code: '201', name: 'Customer Chappal Management' },
            { code: '202', name: 'Sale Crowd Control' },
            { code: '204', name: 'Hindi' },
            { code: '209', name: 'Line Cutting Diplomacy' },
            { code: '203', name: 'Cash Counter Psychology' }, // Additional
            { code: '138', name: 'BRAHMOS THROW' }            // Additional
        ];
        // Decide pass/fail randomly (80% pass, 20% fail)
        const shouldPass = Math.random() < 0.8;
        let marksArr;
        if (shouldPass) {
            // Generate marks for PASS: percentage > 75, <=2 fails
            marksArr = subjects.map((sub, idx) => {
                let theory = Math.floor(Math.random() * 21) + 60; // 60-80
                let practical = Math.floor(Math.random() * 6) + 15; // 15-20
                let total = theory + practical;
                return {
                    ...sub,
                    theory,
                    practical,
                    total,
                    grade: getGrade(total),
                    isAdditional: idx >= 4
                };
            });
            // Optionally, force up to 2 fails (total < 33)
            let failCount = Math.floor(Math.random() * 3); // 0, 1, or 2 fails
            let failIndices = [];
            while (failIndices.length < failCount) {
                let idx = Math.floor(Math.random() * 6);
                if (!failIndices.includes(idx)) failIndices.push(idx);
            }
            failIndices.forEach(idx => {
                marksArr[idx].theory = Math.floor(Math.random() * 20); // 0-19
                marksArr[idx].practical = Math.floor(Math.random() * 5); // 0-4
                marksArr[idx].total = marksArr[idx].theory + marksArr[idx].practical;
                marksArr[idx].grade = getGrade(marksArr[idx].total);
            });
        } else {
            // Generate marks for FAIL: percentage < 75 or >3 fails
            marksArr = subjects.map((sub, idx) => {
                let theory = Math.floor(Math.random() * 41) + 10; // 10-50
                let practical = Math.floor(Math.random() * 11); // 0-10
                let total = theory + practical;
                return {
                    ...sub,
                    theory,
                    practical,
                    total,
                    grade: getGrade(total),
                    isAdditional: idx >= 4
                };
            });
            // Optionally, force 3 or more fails
            let failCount = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5 fails
            let failIndices = [];
            while (failIndices.length < failCount) {
                let idx = Math.floor(Math.random() * 6);
                if (!failIndices.includes(idx)) failIndices.push(idx);
            }
            failIndices.forEach(idx => {
                marksArr[idx].theory = Math.floor(Math.random() * 20); // 0-19
                marksArr[idx].practical = Math.floor(Math.random() * 5); // 0-4
                marksArr[idx].total = marksArr[idx].theory + marksArr[idx].practical;
                marksArr[idx].grade = getGrade(marksArr[idx].total);
            });
        }
        // Calculate best 5 percentage
        let best5 = marksArr.slice(0, 6).sort((a, b) => b.total - a.total).slice(0, 5);
        let best5Total = best5.reduce((sum, s) => sum + s.total, 0);
        let percentage = (best5Total / 500 * 100).toFixed(2);
        // Calculate result status (use new logic)
        const result = getResultStatus(marksArr, percentage);
        // Fill result page
        document.getElementById('resRoll').textContent = roll;
        document.getElementById('resAdmit').textContent = admit;
        document.getElementById('resName').textContent = name;
        document.getElementById('resDOB').textContent = dob;
        // Fill marks table
        let marksBody = document.getElementById('marksBody');
        marksBody.innerHTML = '';
        marksArr.forEach(sub => {
            let tr = document.createElement('tr');
            tr.innerHTML = `<td>${sub.code}</td><td>${sub.name}${sub.isAdditional ? ' (Additional)' : ''}</td><td>${sub.theory}</td><td>${sub.practical}</td><td>${sub.total}</td><td>${sub.grade}</td>`;
            marksBody.appendChild(tr);
        });
        // Status, summary, remarks
        document.getElementById('finalStatus').textContent = result.status;
        document.getElementById('totalMarks').textContent = `Best 5 Total: ${best5Total}`;
        document.getElementById('percentage').textContent = `Percentage: ${percentage}%`;
        document.getElementById('cutoff').textContent = `Remark: ${result.remark}`;
        // Show result section, hide form section
        document.getElementById('form-section').style.display = 'none';
        document.getElementById('result-section').style.display = 'block';
    });

    // Back button logic
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            document.getElementById('result-section').style.display = 'none';
            document.getElementById('form-section').style.display = 'flex';
            setCaptcha();
            document.getElementById('resultForm').reset();
        });
    }
}); 