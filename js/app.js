/* =========================================================
   BLOODCONNECT
   HOMEPAGE INTERACTIVE CONTROLLER (PURE VANILLA JS)
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    // 1. Interactive Blood Group Compatibility Quick Guide on Homepage
    const bloodGroupCards = document.querySelectorAll(".blood-group");

    const COMPATIBILITY_INFO = {
        "A+": "Can donate to: A+, AB+ | Can receive from: A+, A-, O+, O-",
        "A−": "Can donate to: A+, A-, AB+, AB- | Can receive from: A-, O-",
        "B+": "Can donate to: B+, AB+ | Can receive from: B+, B-, O+, O-",
        "B−": "Can donate to: B+, B-, AB+, AB- | Can receive from: B-, O-",
        "AB+": "Universal Recipient: Can receive from all 8 blood groups | Can donate to: AB+",
        "AB−": "Rare Group: Can donate to: AB+, AB- | Can receive from: AB-, A-, B-, O-",
        "O+": "Can donate to: O+, A+, B+, AB+ | Can receive from: O+, O-",
        "O−": "Universal Donor: Can donate red cells to all 8 blood groups! | Can receive from: O-"
    };

    bloodGroupCards.forEach(card => {
        card.style.cursor = "pointer";
        card.setAttribute("title", "Click to see compatibility");

        card.addEventListener("click", function () {
            const group = this.textContent.trim();
            const info = COMPATIBILITY_INFO[group] || "Blood group compatibility verified.";

            // Visual feedback
            bloodGroupCards.forEach(c => {
                c.style.transform = "none";
                c.style.borderColor = "";
            });
            this.style.transform = "scale(1.1) translateY(-4px)";
            this.style.borderColor = "var(--red)";

            // Show temporary informative tooltip or alert
            showMiniToast(`Blood Group ${group}: ${info}`);
        });
    });

    // Helper toast popup
    function showMiniToast(message) {
        let existingToast = document.getElementById("homeBloodToast");
        if (!existingToast) {
            existingToast = document.createElement("div");
            existingToast.id = "homeBloodToast";
            existingToast.style.position = "fixed";
            existingToast.style.bottom = "24px";
            existingToast.style.left = "50%";
            existingToast.style.transform = "translateX(-50%)";
            existingToast.style.background = "#171717";
            existingToast.style.color = "#ffffff";
            existingToast.style.padding = "12px 24px";
            existingToast.style.borderRadius = "30px";
            existingToast.style.fontSize = "13px";
            existingToast.style.fontWeight = "600";
            existingToast.style.boxShadow = "0 10px 30px rgba(0,0,0,0.25)";
            existingToast.style.zIndex = "9999";
            existingToast.style.transition = "all 0.3s ease";
            existingToast.style.maxWidth = "90%";
            existingToast.style.textAlign = "center";
            document.body.appendChild(existingToast);
        }

        existingToast.textContent = message;
        existingToast.style.opacity = "1";
        existingToast.style.visibility = "visible";

        clearTimeout(window._toastTimeout);
        window._toastTimeout = setTimeout(() => {
            if (existingToast) {
                existingToast.style.opacity = "0";
                existingToast.style.visibility = "hidden";
            }
        }, 4500);
    }
});
