import uuid
from pathlib import Path
from typing import List

import genanki

from backend.src.agents.flashcard_agent.schema import MultipleChoiceQuestion, LearningCard


class AnkiDeckGenerator:
    """Generates Anki .apkg files from flashcard data."""

    def __init__(self):
        self.output_dir = Path("/tmp/anki_output")
        self.output_dir.mkdir(exist_ok=True)

    def create_testing_deck(self, questions: List[MultipleChoiceQuestion], deck_name: str) -> str:
        """Create Anki deck for multiple choice questions with clickable options."""
        # Create model for interactive multiple choice
        model = genanki.Model(
            1607392319,
            'Interactive Multiple Choice',
            fields=[
                {'name': 'Question'},
                {'name': 'OptionA'},
                {'name': 'OptionB'},
                {'name': 'OptionC'},
                {'name': 'OptionD'},
                {'name': 'CorrectAnswer'},
                {'name': 'Explanation'},
            ],
            templates=[
                {
                    'name': 'Card 1',
                    'qfmt': self._get_front_template(),
                    'afmt': self._get_back_template(),
                },
            ],
            css=self._get_mcq_css()
        )

        # Create deck
        deck = genanki.Deck(
            2059400110,
            deck_name
        )

        # Add questions as notes
        for question in questions:
            note = genanki.Note(
                model=model,
                fields=[
                    question.question,
                    question.options['A'],
                    question.options['B'],
                    question.options['C'],
                    question.options['D'],
                    question.correct_answer,
                    question.explanation
                ]
            )
            deck.add_note(note)

        # Generate package
        output_path = self.output_dir / f"{uuid.uuid4().hex}.apkg"
        package = genanki.Package(deck)
        package.write_to_file(str(output_path))

        return str(output_path)

    def create_learning_deck(self, cards: List[LearningCard], deck_name: str) -> str:
        """Create Anki deck for learning flashcards."""
        # Create model for basic front/back cards
        model = genanki.Model(
            1607392320,
            'Learning Flashcard',
            fields=[
                {'name': 'Front'},
                {'name': 'Back'},
                {'name': 'Chapter'},
                {'name': 'Image'},
            ],
            templates=[
                {
                    'name': 'Card 1',
                    'qfmt': '''
                    <div class="card-container">
                        <div class="chapter-tag">{{Chapter}}</div>
                        <div class="front-content">{{Front}}</div>
                        {{#Image}}<div class="image-container">{{Image}}</div>{{/Image}}
                    </div>
                    ''',
                    'afmt': '''
                    <div class="card-container">
                        <div class="chapter-tag">{{Chapter}}</div>
                        <div class="front-content">{{Front}}</div>
                        <hr>
                        <div class="back-content">{{Back}}</div>
                        {{#Image}}<div class="image-container">{{Image}}</div>{{/Image}}
                    </div>
                    ''',
                },
            ],
            css='''
            .card-container {
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                line-height: 1.6;
            }

            .chapter-tag {
                background-color: #007bff;
                color: white;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: bold;
                display: inline-block;
                margin-bottom: 15px;
            }

            .front-content {
                font-size: 18px;
                font-weight: bold;
                color: #333;
                margin-bottom: 15px;
            }

            .back-content {
                font-size: 16px;
                color: #555;
                margin-top: 15px;
            }

            .image-container {
                text-align: center;
                margin: 20px 0;
            }

            .image-container img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            hr {
                border: none;
                height: 1px;
                background-color: #ddd;
                margin: 20px 0;
            }
            '''
        )

        # Create deck
        deck = genanki.Deck(
            2059400111,
            deck_name
        )

        # Collect media files
        media_files = []

        # Add cards as notes
        for card in cards:
            # Handle image if present
            image_html = ""
            if card.image_path and Path(card.image_path).exists():
                image_filename = Path(card.image_path).name
                media_files.append(card.image_path)
                image_html = f'<img src="{image_filename}" alt="Chapter illustration">'

            note = genanki.Note(
                model=model,
                fields=[
                    card.front,
                    card.back,
                    card.chapter,
                    image_html
                ]
            )
            deck.add_note(note)

        # Generate package
        output_path = self.output_dir / f"{uuid.uuid4().hex}.apkg"
        package = genanki.Package(deck)
        package.media_files = media_files
        package.write_to_file(str(output_path))

        return str(output_path)

    def _get_persistence_script(self) -> str:
        """Get the persistence script for storing user selections."""
        return """
        <script>
        // Store user selection in card data
        function selectOption(option, button) {
            // Remove previous selections
            var buttons = document.querySelectorAll('.option-btn');
            buttons.forEach(btn => btn.classList.remove('selected'));

            // Mark current selection
            button.classList.add('selected');

            // Store selection (this persists across card reviews)
            if (typeof pycmd !== 'undefined') {
                pycmd('ans');
            }
        }

        // Auto-show answer after selection
        function showAnswer() {
            if (typeof pycmd !== 'undefined') {
                pycmd('ans');
            }
        }
        </script>
        """

    def _get_front_template(self) -> str:
        """Get the front template for interactive multiple choice cards."""
        return """
        <div class="question-container">
            <div class="question">{{Question}}</div>
            <div class="options">
                <button class="option-btn" onclick="selectOption('A', this)">
                    <span class="option-letter">A)</span> {{OptionA}}
                </button>
                <button class="option-btn" onclick="selectOption('B', this)">
                    <span class="option-letter">B)</span> {{OptionB}}
                </button>
                <button class="option-btn" onclick="selectOption('C', this)">
                    <span class="option-letter">C)</span> {{OptionC}}
                </button>
                <button class="option-btn" onclick="selectOption('D', this)">
                    <span class="option-letter">D)</span> {{OptionD}}
                </button>
            </div>
        </div>
        """ + self._get_persistence_script()

    def _get_back_template(self) -> str:
        """Get the back template for interactive multiple choice cards."""
        return """
        <div class="question-container">
            <div class="question">{{Question}}</div>
            <div class="options">
                <button class="option-btn {{#CorrectAnswer}}{{#eq CorrectAnswer "A"}}correct{{/eq}}{{/CorrectAnswer}}" disabled>
                    <span class="option-letter">A)</span> {{OptionA}}
                    {{#CorrectAnswer}}{{#eq CorrectAnswer "A"}}<span class="checkmark">✓</span>{{/eq}}{{/CorrectAnswer}}
                </button>
                <button class="option-btn {{#CorrectAnswer}}{{#eq CorrectAnswer "B"}}correct{{/eq}}{{/CorrectAnswer}}" disabled>
                    <span class="option-letter">B)</span> {{OptionB}}
                    {{#CorrectAnswer}}{{#eq CorrectAnswer "B"}}<span class="checkmark">✓</span>{{/eq}}{{/CorrectAnswer}}
                </button>
                <button class="option-btn {{#CorrectAnswer}}{{#eq CorrectAnswer "C"}}correct{{/eq}}{{/CorrectAnswer}}" disabled>
                    <span class="option-letter">C)</span> {{OptionC}}
                    {{#CorrectAnswer}}{{#eq CorrectAnswer "C"}}<span class="checkmark">✓</span>{{/eq}}{{/CorrectAnswer}}
                </button>
                <button class="option-btn {{#CorrectAnswer}}{{#eq CorrectAnswer "D"}}correct{{/eq}}{{/CorrectAnswer}}" disabled>
                    <span class="option-letter">D)</span> {{OptionD}}
                    {{#CorrectAnswer}}{{#eq CorrectAnswer "D"}}<span class="checkmark">✓</span>{{/eq}}{{/CorrectAnswer}}
                </button>
            </div>
            <div class="explanation">
                <strong>Explanation:</strong> {{Explanation}}
            </div>
        </div>
        """

    def _get_mcq_css(self) -> str:
        """Get the CSS styles for multiple choice cards."""
        return """
        .question-container {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .question {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
            line-height: 1.4;
            color: #333;
        }

        .options {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .option-btn {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            border: 2px solid #ddd;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            font-size: 16px;
            text-align: left;
            transition: all 0.2s ease;
            min-height: 50px;
        }

        .option-btn:hover:not(:disabled) {
            border-color: #007bff;
            background-color: #f8f9fa;
        }

        .option-btn.selected {
            border-color: #007bff;
            background-color: #e3f2fd;
        }

        .option-btn.correct {
            border-color: #28a745;
            background-color: #d4edda;
        }

        .option-btn:disabled {
            cursor: not-allowed;
            opacity: 0.8;
        }

        .option-letter {
            font-weight: bold;
            margin-right: 8px;
            color: #666;
        }

        .checkmark {
            color: #28a745;
            font-weight: bold;
            font-size: 18px;
        }

        .explanation {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
            border-radius: 4px;
            font-size: 14px;
            line-height: 1.5;
        }

        .explanation strong {
            color: #007bff;
        }
        """