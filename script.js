

const result = document.getElementById("result");
const history = document.getElementById("history");
const buttons = document.querySelector(".buttons");

let current = "0";
let storedValue = null;
let selectedOperator = null;
let waitingForNumber = false;
let finished = false;

function updateDisplay() {
    result.value = current;
}

function formatNumber(number) {
    if (!Number.isFinite(number)) return "Error";
    return String(Number(number.toPrecision(12)));
}

function getSymbol(operator) {
    return {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷"
    }[operator];
}

function clearAll() {
    current = "0";
    storedValue = null;
    selectedOperator = null;
    waitingForNumber = false;
    finished = false;
    history.textContent = "";
    updateDisplay();
}

function inputNumber(number) {
    if (current === "Error") clearAll();

    if (waitingForNumber || finished) {
        current = number === "00" ? "0" : number;
        waitingForNumber = false;
        finished = false;
    } else if (current === "0") {
        current = number === "00" ? "0" : number;
    } else if (current.replace("-", "").length < 15) {
        current += number;
    }

    updateDisplay();
}

function inputDecimal() {
    if (current === "Error") clearAll();

    if (waitingForNumber || finished) {
        current = "0.";
        waitingForNumber = false;
        finished = false;
    } else if (!current.includes(".")) {
        current += ".";
    }

    updateDisplay();
}

function calculateResult(a, b, op) {
    switch (op) {
        case "+":
            return a + b;
        case "-":
            return a - b;
        case "*":
            return a * b;
        case "/":
            return b === 0 ? NaN : a / b;
        default:
            return b;
    }
}

function chooseOperator(nextOperator) {
    if (current === "Error") return;

    const value = Number(current);

    if (selectedOperator && !waitingForNumber) {
        const answer = calculateResult(
            storedValue,
            value,
            selectedOperator
        );

        if (!Number.isFinite(answer)) {
            showError();
            return;
        }

        current = formatNumber(answer);
        storedValue = answer;
    } else {
        storedValue = value;
    }

    selectedOperator = nextOperator;
    waitingForNumber = true;
    finished = false;

    history.textContent =
        `${current} ${getSymbol(nextOperator)}`;

    updateDisplay();
}

function calculate() {
    if (
        selectedOperator === null ||
        storedValue === null ||
        waitingForNumber ||
        current === "Error"
    ) {
        return;
    }

    const first = storedValue;
    const second = Number(current);
    const op = selectedOperator;
    const answer = calculateResult(first, second, op);

    history.textContent =
        `${formatNumber(first)} ${getSymbol(op)} ` +
        `${formatNumber(second)} =`;

    if (!Number.isFinite(answer)) {
        showError();
        return;
    }

    current = formatNumber(answer);
    storedValue = null;
    selectedOperator = null;
    waitingForNumber = false;
    finished = true;

    updateDisplay();
}

function showError() {
    current = "Error";
    storedValue = null;
    selectedOperator = null;
    waitingForNumber = false;
    finished = true;
    history.textContent = "Cannot divide by zero";
    updateDisplay();
}

function deleteLast() {
    if (current === "Error" || finished) {
        current = "0";
        finished = false;
    } else if (!waitingForNumber) {
        current = current.length > 1
            ? current.slice(0, -1)
            : "0";

        if (current === "-") current = "0";
    }

    updateDisplay();
}

function percentage() {
    if (current === "Error") return;

    current = formatNumber(Number(current) / 100);
    waitingForNumber = false;
    finished = false;

    updateDisplay();
}

function toggleSign() {
    if (current === "Error" || Number(current) === 0) {
        return;
    }

    current = current.startsWith("-")
        ? current.slice(1)
        : "-" + current;

    updateDisplay();
}

// Mouse and touch buttons
buttons.addEventListener("click", function (event) {
    const button = event.target.closest("button");

    if (!button) return;

    if (button.dataset.number !== undefined) {
        inputNumber(button.dataset.number);
        return;
    }

    if (button.dataset.operator) {
        chooseOperator(button.dataset.operator);
        return;
    }

    switch (button.dataset.action) {
        case "clear":
            clearAll();
            break;

        case "delete":
            deleteLast();
            break;

        case "decimal":
            inputDecimal();
            break;

        case "percent":
            percentage();
            break;

        case "sign":
            toggleSign();
            break;

        case "equals":
            calculate();
            break;
    }
});

// Keyboard support
document.addEventListener("keydown", function (event) {
    if (/^[0-9]$/.test(event.key)) {
        inputNumber(event.key);
    } else if (event.key === ".") {
        inputDecimal();
    } else if (["+", "-", "*", "/"].includes(event.key)) {
        chooseOperator(event.key);
    } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        calculate();
    } else if (event.key === "Backspace") {
        deleteLast();
    } else if (event.key === "Escape") {
        clearAll();
    } else if (event.key === "%") {
        percentage();
    }
});

updateDisplay();

const viewButtons = document.querySelectorAll("[data-view]");

viewButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const selectedView = button.dataset.view;
        const isPhoneView = selectedView === "phone";

        // Change the page layout
        document.body.classList.toggle("view-phone", isPhoneView);

        // Update the selected button
        viewButtons.forEach(function (btn) {
            const isActive = btn === button;

            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-pressed", String(isActive));
        });
    });
});


const themeToggleButton = document.getElementById("themeToggle");

function updateThemeButton(isLight) {
    const icon = themeToggleButton.querySelector(".theme-icon");
    const label = themeToggleButton.querySelector(".theme-label");

    icon.textContent = isLight ? "☾" : "☀";
    label.textContent = isLight ? "Dark" : "Light";

    themeToggleButton.setAttribute(
        "aria-label",
        isLight ? "Switch to dark mode" : "Switch to light mode"
    );

    themeToggleButton.setAttribute(
        "aria-pressed",
        String(isLight)
    );
}

themeToggleButton.addEventListener("click", function () {
    const isLight = document.body.classList.toggle("light-mode");

    updateThemeButton(isLight);
});
