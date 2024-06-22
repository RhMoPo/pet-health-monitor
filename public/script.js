document.getElementById('claimForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const petName = document.getElementById('petName').value;
    const ownerName = document.getElementById('ownerName').value;
    const typeOfClaim = document.getElementById('typeOfClaim').value;

    const response = await fetch('/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petName, ownerName, typeOfClaim })
    });

    const newClaim = await response.json();
    addClaimToList(newClaim);

    
    document.getElementById('petName').value = '';
    document.getElementById('ownerName').value = '';
    document.getElementById('typeOfClaim').value = '';
});

async function fetchClaims() {
    const response = await fetch('/claims');
    const claims = await response.json();
    claims.forEach(addClaimToList);
}

function addClaimToList(claim) {
    const claimsList = document.getElementById('claimsList');
    const claimItem = document.createElement('li');
    claimItem.textContent = `${claim.petName} - ${claim.ownerName} - ${claim.typeOfClaim} - ${claim.status}`;
    claimsList.appendChild(claimItem);
}

fetchClaims();
