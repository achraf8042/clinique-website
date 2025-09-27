// Initialize AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Loading Screen
window.addEventListener('load', function() {
    setTimeout(function() {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 1000);
});

// Back to Top Button
const backToTopButton = document.getElementById('backToTop');

window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

backToTopButton.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// Initialize Flatpickr
flatpickr("#appointmentDate", {
    locale: "fr",
    minDate: "today",
    maxDate: new Date().fp_incr(30),
    disable: [
        function(date) {
            return (date.getDay() === 0 || date.getDay() === 6);
        }
    ],
    onChange: function(selectedDates, dateStr, instance) {
        updateTimeSlots();
    }
});

// Booking System Variables
let currentStep = 1;
let selectedDoctor = null;
let selectedTime = null;
let bookingData = {};

// Step Navigation
function nextStep(step) {
    if (validateStep(step)) {
        document.getElementById(`formStep${step}`).classList.remove('active');
        document.getElementById(`step${step}`).classList.remove('active');
        document.getElementById(`step${step}`).classList.add('completed');
        
        currentStep++;
        document.getElementById(`formStep${currentStep}`).classList.add('active');
        document.getElementById(`step${currentStep}`).classList.add('active');
        
        // Update summary on last step
        if (currentStep === 4) {
            updateSummary();
        }
    }
}

function prevStep(step) {
    document.getElementById(`formStep${step}`).classList.remove('active');
    document.getElementById(`step${step}`).classList.remove('active');
    
    currentStep--;
    document.getElementById(`formStep${currentStep}`).classList.add('active');
    document.getElementById(`step${currentStep}`).classList.remove('completed');
}

// Validate Steps
function validateStep(step) {
    switch(step) {
        case 1:
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            
            if (!fullName || !email || !phone) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return false;
            }
            
            // Store personal info
            bookingData.personal = {
                fullName: fullName,
                email: email,
                phone: phone,
                birthDate: document.getElementById('birthDate').value,
                address: document.getElementById('address').value,
                reason: document.getElementById('reason').value
            };
            return true;
            
        case 2:
            if (!selectedDoctor) {
                alert('Veuillez sélectionner un médecin.');
                return false;
            }
            return true;
            
        case 3:
            const date = document.getElementById('appointmentDate').value;
            if (!date || !selectedTime) {
                alert('Veuillez sélectionner une date et une heure.');
                return false;
            }
            
            bookingData.appointment = {
                date: date,
                time: selectedTime,
                type: document.getElementById('consultationType').value
            };
            return true;
            
        default:
            return true;
    }
}

// Doctor Selection
function selectDoctor(element, name, specialty) {
    // Remove previous selection
    document.querySelectorAll('.doctor-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked card
    element.classList.add('selected');
    selectedDoctor = { name, specialty };
    
    // Enable next button
    document.getElementById('doctorNextBtn').disabled = false;
}

// Filter Doctors by Specialty
function filterDoctors() {
    const specialty = document.getElementById('specialtySelect').value;
    const doctorCards = document.querySelectorAll('.doctor-card');
    
    doctorCards.forEach(card => {
        if (specialty === '' || card.dataset.specialty === specialty) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Time Slot Selection
function selectTime(element, time) {
    // Remove previous selection
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Add selection to clicked slot
    element.classList.add('selected');
    selectedTime = time;
    
    // Enable next button
    document.getElementById('timeNextBtn').disabled = false;
}

// Update Time Slots (simulate availability)
function updateTimeSlots() {
    const timeSlots = document.querySelectorAll('.time-slot');
    
    // Simulate random availability
    timeSlots.forEach(slot => {
        const isAvailable = Math.random() > 0.3; // 70% chance of being available
        
        if (isAvailable) {
            slot.classList.remove('disabled');
            slot.onclick = function() { selectTime(this, slot.textContent); };
        } else {
            slot.classList.add('disabled');
            slot.onclick = null;
        }
    });
}

// Update Booking Summary
function updateSummary() {
    document.getElementById('summaryPatient').textContent = bookingData.personal.fullName;
    document.getElementById('summaryDoctor').textContent = `${selectedDoctor.name} - ${selectedDoctor.specialty}`;
    document.getElementById('summaryDate').textContent = new Date(bookingData.appointment.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('summaryTime').textContent = bookingData.appointment.time;
    
    const consultationTypes = {
        'first': 'Première Consultation',
        'follow-up': 'Consultation de Suivi',
        'emergency': 'Urgence',
        'routine': 'Contrôle Routine'
    };
    document.getElementById('summaryType').textContent = consultationTypes[bookingData.appointment.type];
}

// Terms and Conditions Checkbox
document.getElementById('termsCheck').addEventListener('change', function() {
    document.getElementById('submitBtn').disabled = !this.checked;
});

// Submit Booking
function submitBooking() {
    // Show success message
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    
    // Reset form
    setTimeout(() => {
        // Reset all steps
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`formStep${i}`).classList.remove('active');
            document.getElementById(`step${i}`).classList.remove('active', 'completed');
        }
        
        // Show first step
        document.getElementById('formStep1').classList.add('active');
        document.getElementById('step1').classList.add('active');
        currentStep = 1;
        
        // Reset selections
        selectedDoctor = null;
        selectedTime = null;
        bookingData = {};
        
        // Reset form fields
        document.getElementById('personalInfoForm').reset();
        document.querySelectorAll('.doctor-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        document.getElementById('appointmentDate').value = '';
        document.getElementById('consultationType').value = 'first';
        document.getElementById('termsCheck').checked = false;
        document.getElementById('reminderCheck').checked = false;
        
        // Disable buttons
        document.getElementById('doctorNextBtn').disabled = true;
        document.getElementById('timeNextBtn').disabled = true;
        document.getElementById('submitBtn').disabled = true;
        
        // Hide success message
        successMessage.style.display = 'none';
        
        // Scroll to top of booking section
        document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    }, 5000);
}

// Contact Form
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.');
    this.reset();
});

// Newsletter Form
document.getElementById('newsletterForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    if (email) {
        alert('Merci de vous être abonné ! Nous vous tiendrons informé de nos derniers conseils santé et actualités.');
        this.reset();
    }
});

// Counter Animation
const counters = document.querySelectorAll('.stat-number');
const speed = 200;

const countUp = (counter) => {
    const target = +counter.getAttribute('data-count');
    const count = +counter.innerText;
    const increment = target / speed;

    if (count < target) {
        counter.innerText = Math.ceil(count + increment);
        setTimeout(() => countUp(counter), 10);
    } else {
        counter.innerText = target;
    }
};

// Intersection Observer for counters
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            countUp(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

counters.forEach(counter => {
    counterObserver.observe(counter);
});

// Initialize time slots on page load
updateTimeSlots();

// Add current year to footer
document.querySelector('.footer-bottom p').innerHTML = 
    `&copy; ${new Date().getFullYear()} Clinique MediCare. Tous droits réservés. | Conçu avec <i class="fas fa-heart"></i> pour une meilleure santé`;
