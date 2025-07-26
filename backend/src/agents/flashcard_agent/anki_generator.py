import uuid
from pathlib import Path
from typing import List

import genanki

from .schema import MultipleChoiceQuestion, LearningCard


class AnkiDeckGenerator:
    """Generates Anki .apkg files from flashcard data."""

    def __init__(self):
        self.output_dir = Path("/tmp/anki_output")
        self.output_dir.mkdir(exist_ok=True)

    def create_testing_deck(self, questions: List[MultipleChoiceQuestion], deck_name: str, pdf_filename: str = None) -> str:
        """Create Anki deck for multiple choice questions with clickable options."""
        # Create model for interactive multiple choice
        model = genanki.Model(
            1607392319,
            'Interactive Multiple Choice',
            fields=[
                {'name': 'Question'},
                {'name': 'ChoiceA'},
                {'name': 'ChoiceB'},
                {'name': 'ChoiceC'},
                {'name': 'ChoiceD'},
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
        if pdf_filename:
            # Extract filename without extension and add .apkg
            base_name = Path(pdf_filename).stem
            output_path = self.output_dir / f"{base_name}.apkg"
        else:
            # Fallback to UUID if no filename provided
            output_path = self.output_dir / f"{uuid.uuid4().hex}.apkg"
        package = genanki.Package(deck)
        package.write_to_file(str(output_path))

        return str(output_path)

    def create_learning_deck(self, cards: List[LearningCard], deck_name: str, pdf_filename: str = None) -> str:
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
        if pdf_filename:
            # Extract filename without extension and add .apkg
            base_name = Path(pdf_filename).stem
            output_path = self.output_dir / f"{base_name}.apkg"
        else:
            # Fallback to UUID if no filename provided
            output_path = self.output_dir / f"{uuid.uuid4().hex}.apkg"
        package = genanki.Package(deck)
        package.media_files = media_files
        package.write_to_file(str(output_path))

        return str(output_path)

    def _get_persistence_script(self) -> str:
        """Get the persistence script for storing user selections."""
        return '''
<script>
// Anki Persistence - Simplified version of https://github.com/SimonLammer/anki-persistence
if (void 0 === window.Persistence) {
    var _persistenceKey = "github.com/SimonLammer/anki-persistence/";
    window.Persistence_sessionStorage = function() {
        var e = !1;
        try {
            "object" == typeof window.sessionStorage && (e = !0, 
                this.clear = function() {
                    for (var e = 0; e < sessionStorage.length; e++) {
                        var t = sessionStorage.key(e);
                        0 == t.indexOf(_persistenceKey) && (sessionStorage.removeItem(t), e--)
                    }
                }, 
                this.setItem = function(e, t) {
                    sessionStorage.setItem(_persistenceKey + e, JSON.stringify(t));
                }, 
                this.getItem = function(e) {
                    var t = sessionStorage.getItem(_persistenceKey + e);
                    return t ? JSON.parse(t) : null;
                },
                this.removeItem = function(e) {
                    sessionStorage.removeItem(_persistenceKey + e);
                });
        } catch (e) {}
        this.isAvailable = function() { return e; };
    };
    
    window.Persistence = new Persistence_sessionStorage();
    
    // Fallback to window object if sessionStorage not available
    if (!Persistence.isAvailable()) {
        window.Persistence = {
            _data: {},
            isAvailable: function() { return true; },
            clear: function() { this._data = {}; },
            setItem: function(key, value) { this._data[key] = value; },
            getItem: function(key) { return this._data[key] || null; },
            removeItem: function(key) { delete this._data[key]; }
        };
    }
}
</script>
'''

    def _get_front_template(self) -> str:
        """Get the front template for interactive multiple choice cards."""
        return self._get_persistence_script() + '''
<div class="mcq-container">
    <div class="question">{{Question}}</div>
    <div class="choices">
        {{#ChoiceA}}<div class="choice" data-choice="A" onclick="selectChoice(this)">A. {{ChoiceA}}</div>{{/ChoiceA}}
        {{#ChoiceB}}<div class="choice" data-choice="B" onclick="selectChoice(this)">B. {{ChoiceB}}</div>{{/ChoiceB}}
        {{#ChoiceC}}<div class="choice" data-choice="C" onclick="selectChoice(this)">C. {{ChoiceC}}</div>{{/ChoiceC}}
        {{#ChoiceD}}<div class="choice" data-choice="D" onclick="selectChoice(this)">D. {{ChoiceD}}</div>{{/ChoiceD}}
    </div>
</div>

<script>
function selectChoice(element) {
    // Remove previous selections
    document.querySelectorAll('.choice').forEach(choice => {
        choice.classList.remove('selected');
    });

    // Mark this choice as selected
    element.classList.add('selected');

    // Store the selected answer
    window.selectedAnswer = element.getAttribute('data-choice');
}
</script>
'''

    def _get_back_template(self) -> str:
        """Get the back template for interactive multiple choice cards."""
        return self._get_persistence_script() + '''
<div class="mcq-container">
    <div class="question">{{Question}}</div>
    <div class="choices">
        {{#ChoiceA}}<div class="choice" data-choice="A" onclick="selectChoice(this)">A. {{ChoiceA}}</div>{{/ChoiceA}}
        {{#ChoiceB}}<div class="choice" data-choice="B" onclick="selectChoice(this)">B. {{ChoiceB}}</div>{{/ChoiceB}}
        {{#ChoiceC}}<div class="choice" data-choice="C" onclick="selectChoice(this)">C. {{ChoiceC}}</div>{{/ChoiceC}}
        {{#ChoiceD}}<div class="choice" data-choice="D" onclick="selectChoice(this)">D. {{ChoiceD}}</div>{{/ChoiceD}}
    </div>

    <div class="answer-section">
        <div class="correct-answer">Correct Answer: {{CorrectAnswer}}</div>
        {{#Explanation}}<div class="explanation">{{Explanation}}</div>{{/Explanation}}
    </div>
</div>

<script>
function selectChoice(element) {
    // Remove previous selections
    document.querySelectorAll('.choice').forEach(choice => {
        choice.classList.remove('selected', 'correct', 'incorrect');
    });

    // Mark this choice as selected
    element.classList.add('selected');

    // Get the correct answer
    const correctAnswer = '{{CorrectAnswer}}';
    const selectedChoice = element.getAttribute('data-choice');

    // Show feedback
    document.querySelectorAll('.choice').forEach(choice => {
        const choiceValue = choice.getAttribute('data-choice');
        if (choiceValue === correctAnswer) {
            choice.classList.add('correct');
        } else if (choiceValue === selectedChoice && selectedChoice !== correctAnswer) {
            choice.classList.add('incorrect');
        }
    });
}

// Auto-highlight correct answer on back
document.addEventListener('DOMContentLoaded', function() {
    const correctAnswer = '{{CorrectAnswer}}';
    document.querySelectorAll('.choice').forEach(choice => {
        if (choice.getAttribute('data-choice') === correctAnswer) {
            choice.classList.add('correct');
        }
    });
});
</script>
'''

    def _get_mcq_css(self) -> str:
        """Get the CSS styles for multiple choice cards."""
        return '''
.mcq-container {
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
    color: white;
}

.choices {
    margin-bottom: 20px;
}

.choice {
    background: #f8f9fa;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    padding: 12px 16px;
    margin: 8px 0;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 16px;
    line-height: 1.4;
    color: black;
}

.choice:hover {
    background: #e9ecef;
    border-color: #6c757d;
}

.choice.selected {
    background: #cce5ff;
    border-color: #007bff;
}

.choice.correct {
    background: #d4edda;
    border-color: #28a745;
    color: #155724;
}

.choice.incorrect {
    background: #f8d7da;
    border-color: #dc3545;
    color: #721c24;
}

.answer-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 2px solid #e9ecef;
}

.correct-answer {
    font-weight: bold;
    color: #28a745;
    margin-bottom: 10px;
    font-size: 16px;
}

.explanation {
    background: #f8f9fa;
    border-left: 4px solid #007bff;
    padding: 12px 16px;
    margin-top: 10px;
    font-style: italic;
    line-height: 1.4;
    color: black;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .mcq-container {
        padding: 15px;
    }

    .question {
        font-size: 16px;
    }

    .choice {
        font-size: 14px;
        padding: 10px 12px;
    }
}
'''