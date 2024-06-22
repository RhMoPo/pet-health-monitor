document.getElementById('claimForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const petName = document.getElementById('petName').value;
    const claimAmount = document.getElementById('claimAmount').value;
    const description = document.getElementById('description').value;

    const claim = { petName, claimAmount, description };

    fetch('/submit-claim', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(claim),
    })
    .then(response => response.json())
    .then(data => {
        addClaimToList(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });

    document.getElementById('claimForm').reset();
});

function addClaimToList(claim) {
    const claimsList = document.getElementById('claimsList');
    const listItem = document.createElement('li');
    listItem.textContent = `Pet: ${claim.petName}, Amount: ${claim.claimAmount}, Description: ${claim.description}`;
    claimsList.appendChild(listItem);
}

window.onload = function() {
    fetch('/claims')
        .then(response => response.json())
        .then(data => {
            data.forEach(claim => {
                addClaimToList(claim);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
};
