// Handle file input display
document.getElementById('resumeFile').addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name || 'Choose a file...';
    document.getElementById('fileName').textContent = fileName;
});

// Handle form submission
document.getElementById('uploadForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('resumeFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a resume file');
        return;
    }
    
    // Show loading state
    const analyzeBtn = document.getElementById('analyzeBtn');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    
    analyzeBtn.disabled = true;
    btnText.textContent = 'Analyzing...';
    btnLoader.style.display = 'block';
    
    // Prepare form data
    const formData = new FormData();
    formData.append('resume', file);
    
    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Analysis failed');
        }
        
        const data = await response.json();
        displayResults(data);
        
        // Hide upload section and show results
        document.querySelector('.upload-section').style.display = 'none';
        document.getElementById('results').style.display = 'block';
        
    } catch (error) {
        alert('Error: ' + error.message);
        console.error('Error:', error);
    } finally {
        // Reset button state
        analyzeBtn.disabled = false;
        btnText.textContent = 'Analyze Resume';
        btnLoader.style.display = 'none';
    }
});

// Display results
function displayResults(data) {
    // Score
    const score = data.overall_match_score || 0;
    document.getElementById('scoreValue').textContent = score;
    
    // Animate score circle
    const circumference = 283; // 2 * PI * radius (45)
    const offset = circumference - (score / 100) * circumference;
    const scoreCircle = document.getElementById('scoreCircle');
    scoreCircle.style.strokeDashoffset = offset;
    
    // Change color based on score
    if (score >= 80) {
        scoreCircle.style.stroke = '#10b981'; // green
    } else if (score >= 60) {
        scoreCircle.style.stroke = '#3b82f6'; // blue
    } else if (score >= 40) {
        scoreCircle.style.stroke = '#f59e0b'; // orange
    } else {
        scoreCircle.style.stroke = '#ef4444'; // red
    }
    
    // Recommendation
    const recommendation = data.recommendation || 'NOT RECOMMENDED';
    document.getElementById('recommendationText').textContent = recommendation;
    
    const recBadge = document.getElementById('recommendation');
    recBadge.className = 'recommendation-badge';
    
    if (recommendation === 'HIGHLY RECOMMENDED') {
        recBadge.classList.add('highly-recommended');
    } else if (recommendation === 'RECOMMENDED') {
        recBadge.classList.add('recommended');
    } else if (recommendation === 'MAYBE') {
        recBadge.classList.add('maybe');
    } else {
        recBadge.classList.add('not-recommended');
    }
    
    // Summary
    document.getElementById('summaryText').textContent = data.overall_summary || 'No summary available';
    
    // Strengths
    const strengthsList = document.getElementById('strengthsList');
    strengthsList.innerHTML = '';
    if (data.strengths && data.strengths.length > 0) {
        data.strengths.forEach(strength => {
            const li = document.createElement('li');
            li.textContent = strength;
            strengthsList.appendChild(li);
        });
    } else {
        strengthsList.innerHTML = '<li>No strengths identified</li>';
    }
    
    // Gaps
    const gapsList = document.getElementById('gapsList');
    gapsList.innerHTML = '';
    if (data.gaps && data.gaps.length > 0) {
        data.gaps.forEach(gap => {
            const li = document.createElement('li');
            li.textContent = gap;
            gapsList.appendChild(li);
        });
    } else {
        gapsList.innerHTML = '<li>No gaps identified</li>';
    }
    
    // Matched Skills
    const matchedSkillsDiv = document.getElementById('matchedSkills');
    matchedSkillsDiv.innerHTML = '';
    if (data.skills_match?.matched_skills && data.skills_match.matched_skills.length > 0) {
        data.skills_match.matched_skills.forEach(skill => {
            const span = document.createElement('span');
            span.className = 'skill-tag matched';
            span.textContent = skill;
            matchedSkillsDiv.appendChild(span);
        });
    } else {
        matchedSkillsDiv.innerHTML = '<span style="color: #64748b;">No matched skills</span>';
    }
    
    // Missing Skills
    const missingSkillsDiv = document.getElementById('missingSkills');
    missingSkillsDiv.innerHTML = '';
    if (data.skills_match?.missing_skills && data.skills_match.missing_skills.length > 0) {
        data.skills_match.missing_skills.forEach(skill => {
            const span = document.createElement('span');
            span.className = 'skill-tag missing';
            span.textContent = skill;
            missingSkillsDiv.appendChild(span);
        });
    } else {
        missingSkillsDiv.innerHTML = '<span style="color: #64748b;">No missing skills</span>';
    }
    
    // Experience Analysis
    document.getElementById('experienceText').textContent = data.experience_analysis || 'No experience analysis available';
}

// Reset form
function resetForm() {
    document.querySelector('.upload-section').style.display = 'flex';
    document.getElementById('results').style.display = 'none';
    document.getElementById('uploadForm').reset();
    document.getElementById('fileName').textContent = 'Choose a file...';
}
