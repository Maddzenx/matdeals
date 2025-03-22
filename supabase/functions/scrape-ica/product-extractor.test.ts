
// This file now serves as a central import point for all test files
// Each individual test case has been moved to its own file in the tests directory

// Import all test files to ensure they run when this file is executed
import "./tests/name-extractor.test.ts";
import "./tests/description-extractor.test.ts";
import "./tests/price-extractor-basic.test.ts";
import "./tests/price-extractor-complex.test.ts";
import "./tests/price-extractor-edge-cases.test.ts";
import "./tests/price-extractor-variations.test.ts";
import "./tests/offer-details-member-price.test.ts";
import "./tests/image-extractor.test.ts";
import "./tests/card-processor.test.ts";

// No tests are defined directly in this file anymore
// This file serves as an entry point to run all tests
