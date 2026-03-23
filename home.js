// 1. NAVBAR FETCHING (Runs on every page)
document.addEventListener("DOMContentLoaded", () => {
    const placeholder = document.getElementById('navbar-placeholder');
    
    if (placeholder) {
        fetch('navbar.html')
            .then(response => response.text())
            .then(data => {
                placeholder.innerHTML = data;
                
                // Optional: Fade in effect if you added the opacity-0 class
                const nav = document.getElementById('main-nav');
                if (nav) {
                    setTimeout(() => nav.classList.remove('opacity-0'), 50);
                }
            })
            .catch(err => console.error('Error loading navbar:', err));
    }

    // 2. COUNTER LOGIC (Only runs if elements exist on the page)
    const counters = document.querySelectorAll(".stat-number");
    
    // This 'if' check prevents errors on pages that don't have the stats
    if (counters.length > 0) {
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute("data-target");
                const count = +counter.innerText.replace(/,/g, ''); // Fix for existing commas

                const increment = Math.ceil(target / 100);

                if (count < target) {
                    counter.innerText = count + increment;
                    setTimeout(updateCount, 20);
                } else {
                    counter.innerText = target.toLocaleString();
                }
            };
            updateCount();
        });
    }
});