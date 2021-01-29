const TestResult = function(testResult) {
    this.time_and_date = testResult.time_and_date;
    this.test_link_code = testResult.test_link_code;
    this.device_number = testResult.device_number;
    this.test_area_id = testResult.test_area_id;
    this.result = testResult.result;
}

module.exports = TestResult;
