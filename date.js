exports.getDate = function getDate() {
    const today = new Date();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    // let day = today.toLocaleDateString("en-US", options);
    // return day
    return today.toLocaleDateString("en-US", options);
}

module.exports.getDay = function getDay() {
    const today = new Date();
    const options = {
        weekday: "long",
    };
    return today.toLocaleDateString("en-US", options);
}