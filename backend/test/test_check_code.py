import unittest
import os
import tempfile
import json
from ..src.agents.explainer_agent.code_checker import ESLintValidator, find_react_code_in_response, clean_up_response


class TestESLintValidator(unittest.TestCase):
    """Test cases for ESLintValidator class with real ESLint validation"""

    def setUp(self):
        """Set up the ESLint validator"""
        try:
            self.validator = ESLintValidator()
        except FileNotFoundError as e:
            self.skipTest(f"ESLint configuration files not found: {e}")

    def test_valid_simple_component(self):
        """Test validation of a simple valid React component"""
        valid_code = """
        () => {
            return <div>Hello World</div>;
        }
        """

        result = self.validator.validate_jsx(valid_code)
        self.assertTrue(result['valid'], f"Expected valid component, got errors: {result.get('errors', [])}")
        self.assertEqual(len(result['errors']), 0)

    def test_valid_component_with_props(self):
        """Test validation of component with props"""
        valid_code = """
        (props) => {
            return <div>{props.message}</div>;
        }
        """

        result = self.validator.validate_jsx(valid_code)
        self.assertTrue(result['valid'], f"Expected valid component, got errors: {result.get('errors', [])}")

    def test_valid_component_with_recharts(self):
        """Test validation of component using Recharts (allowed import)"""
        valid_code = """
        () => {
            const data = [{name: 'A', value: 100}, {name: 'B', value: 200}];
            return (
                <div>
                    <Recharts.LineChart width={400} height={300} data={data}>
                        <Recharts.XAxis dataKey="name" />
                        <Recharts.YAxis />
                        <Recharts.Line dataKey="value" stroke="#8884d8" />
                    </Recharts.LineChart>
                </div>
            );
        }
        """

        result = self.validator.validate_jsx(valid_code)
        self.assertTrue(result['valid'], f"Expected valid Recharts component, got errors: {result.get('errors', [])}")

    def test_valid_component_with_latex(self):
        """Test validation of component using Latex (allowed import)"""
        valid_code = """
        () => {
            return (
                <div>
                    <h1>Mathematical Formula</h1>
                    <Latex>{"$E = mc^2$"}</Latex>
                </div>
            );
        }
        """

        result = self.validator.validate_jsx(valid_code)
        self.assertTrue(result['valid'], f"Expected valid Latex component, got errors: {result.get('errors', [])}")

    def test_valid_component_with_react_hooks(self):
        """Test validation of component using React hooks"""
        valid_code = """
        () => {
            const [count, setCount] = React.useState(0);
            const [text, setText] = React.useState('Hello');

            return (
                <div>
                    <p>Count: {count}</p>
                    <p>Text: {text}</p>
                    <button onClick={() => setCount(count + 1)}>
                        Increment
                    </button>
                    <input 
                        value={text} 
                        onChange={(e) => setText(e.target.value)} 
                    />
                </div>
            );
        }
        """

        result = self.validator.validate_jsx(valid_code)
        self.assertTrue(result['valid'], f"Expected valid hooks component, got errors: {result.get('errors', [])}")

    def test_invalid_component_syntax_error(self):
        """Test validation of component with JSX syntax error"""
        invalid_code = """
        () => {
            return <div>Hello World<div>;  // Missing closing tag
        }
        """

        result = self.validator.validate_jsx(invalid_code)
        self.assertFalse(result['valid'], "Expected invalid component due to syntax error")
        self.assertGreater(len(result['errors']), 0, "Expected at least one error")

    def test_invalid_component_unclosed_tag(self):
        """Test validation of component with unclosed JSX tag"""
        invalid_code = """
        () => {
            return (
                <div>
                    <p>Some text
                    <span>More text</span>
                </div>
            );  // Missing closing </p> tag
        }
        """

        result = self.validator.validate_jsx(invalid_code)
        self.assertFalse(result['valid'], "Expected invalid component due to unclosed tag")
        self.assertGreater(len(result['errors']), 0, "Expected at least one error")

    def test_invalid_component_undefined_variable(self):
        """Test validation of component with undefined variable"""
        invalid_code = """
        () => {
            return <div>{undefinedVariable}</div>;  // undefinedVariable is not defined
        }
        """

        result = self.validator.validate_jsx(invalid_code)
        self.assertFalse(result['valid'], "Expected invalid component due to undefined variable")
        self.assertGreater(len(result['errors']), 0, "Expected at least one error")

        # Check if the error mentions the undefined variable
        error_messages = [error.get('message', '') for error in result['errors']]
        has_undef_error = any('undefinedVariable' in msg or 'undef' in msg.lower() for msg in error_messages)
        self.assertTrue(has_undef_error, f"Expected undefined variable error, got: {error_messages}")

    def test_component_with_complex_jsx_expressions(self):
        """Test validation of component with complex JSX expressions"""
        valid_code = """
        () => {
            const items = ['apple', 'banana', 'cherry'];
            const isVisible = true;

            return (
                <div>
                    {isVisible && <h1>Fruit List</h1>}
                    <ul>
                        {items.map((item, index) => (
                            <li key={index}>
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                            </li>
                        ))}
                    </ul>
                    {items.length === 0 ? (
                        <p>No items</p>
                    ) : (
                        <p>Total: {items.length} items</p>
                    )}
                </div>
            );
        }
        """

        result = self.validator.validate_jsx(valid_code)
        self.assertTrue(result['valid'], f"Expected valid complex component, got errors: {result.get('errors', [])}")

    def test_component_with_event_handlers(self):
        """Test validation of component with various event handlers"""
        valid_code = """
        () => {
            const [value, setValue] = React.useState('');

            const handleClick = () => {
                console.log('Button clicked');
            };

            const handleChange = (event) => {
                setValue(event.target.value);
            };

            const handleSubmit = (event) => {
                event.preventDefault();
                console.log('Form submitted with value:', value);
            };

            return (
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text"
                        value={value}
                        onChange={handleChange}
                        placeholder="Enter text"
                    />
                    <button type="button" onClick={handleClick}>
                        Click me
                    </button>
                    <button type="submit">
                        Submit
                    </button>
                </form>
            );
        }
        """

        result = self.validator.validate_jsx(valid_code)
        self.assertTrue(result['valid'],
                        f"Expected valid event handler component, got errors: {result.get('errors', [])}")


class TestIntegration(unittest.TestCase):
    """Integration tests combining multiple functions"""

    def setUp(self):
        """Set up the ESLint validator for integration tests"""
        try:
            self.validator = ESLintValidator()
        except FileNotFoundError as e:
            self.skipTest(f"ESLint configuration files not found: {e}")

    def test_full_pipeline_valid_component(self):
        """Test full pipeline from text extraction to validation"""
        text_with_component = """
        Here's a React component for you:

        () => {
            return <div>Hello World</div>;
        }

        This component renders a simple greeting.
        """

        # Extract the React code
        extracted_code = find_react_code_in_response(text_with_component)
        self.assertIsNotNone(extracted_code)

        # Validate the extracted code
        result = self.validator.validate_jsx(extracted_code)
        self.assertTrue(result['valid'], f"Expected valid extracted component, got errors: {result.get('errors', [])}")

    def test_full_pipeline_with_cleanup(self):
        """Test full pipeline including cleanup step"""
        text_with_component = """
        blablabla some explanation text

        const MyComponent = () => {
            const [count, setCount] = React.useState(0);
            return (
                <div>
                    <p>Count: {count}</p>
                    <button onClick={() => setCount(count + 1)}>
                        Increment
                    </button>
                </div>
            );
        };

        more blablabla text afterwards
        """

        # Validate the cleaned code
        result = self.validator.validate_jsx(text_with_component)
        self.assertTrue(result['valid'], f"Expected valid cleaned component, got errors: {result.get('errors', [])}")


    def test_full_pipeline_invalid_component(self):
        """Test full pipeline with invalid component to ensure error detection"""
        text_with_invalid_component = """
        Here's a broken component:

        () => {
            return <div>Hello {undefinedVar}</div>;  // This should cause an error
        }
        """

        # Validate the extracted code (should be invalid due to undefined variable)
        result = self.validator.validate_jsx(text_with_invalid_component)
        self.assertFalse(result['valid'], "Expected invalid component due to undefined variable")
        self.assertGreater(len(result['errors']), 0, "Expected at least one error")


if __name__ == '__main__':
    print("Running comprehensive tests for React code checker...")
    print("=" * 60)

    # Create a test suite
    test_loader = unittest.TestLoader()
    test_suite = unittest.TestSuite()

    # Add all test classes
    test_suite.addTests(test_loader.loadTestsFromTestCase(TestESLintValidator))
    test_suite.addTests(test_loader.loadTestsFromTestCase(TestIntegration))

    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)

    # Print detailed summary
    print(f"\n{'=' * 60}")
    print(f"TEST SUMMARY")
    print(f"{'=' * 60}")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(
        f"Success rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}%")

    if result.failures:
        print(f"\nFAILURES ({len(result.failures)}):")
        for test, traceback in result.failures:
            print(f"- {test}: {traceback.split('AssertionError: ')[-1].split('\\n')[0]}")

    if result.errors:
        print(f"\nERRORS ({len(result.errors)}):")
        for test, traceback in result.errors:
            print(f"- {test}: {traceback.split('\\n')[-2] if traceback else 'Unknown error'}")

    print(f"{'=' * 60}")