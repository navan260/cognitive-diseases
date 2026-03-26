export function analyzeDotTest(data) {
    const { accuracy, avgTime } = data;

    let result = {};

    if (accuracy < 0.5) {
        result.level = "weak";
        result.message = "⚠ You may struggle with number sense";
    } else if (accuracy < 0.8) {
        result.level = "medium";
        result.message = " You have moderate number understanding";
    } else {
        result.level = "strong";
        result.message = " Your number sense is strong";
    }

    result.speed = avgTime > 3 ? "slow" : "fast";

    return result;
}

export function analyzeNumberLineTest(data) {
    const { avgError } = data;
    let result = {};

    if (avgError > 20) {
        result.level = "weak";
        result.message = "⚠ You may struggle with exact placement";
    } else if (avgError > 10) {
        result.level = "medium";
        result.message = " You have moderate placement accuracy";
    } else {
        result.level = "strong";
        result.message = " Your spatial number sense is strong";
    }

    result.speed = "N/A";

    return result;
}