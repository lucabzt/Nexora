# Markdown

It's possible and often times more convenient to write presentation content using Markdown. To create a Markdown slide, add the `data-markdown` attribute to your `<section>` element and wrap the contents in a `<textarea data-template>` like the example below.

```html
<section data-markdown>
  <textarea data-template>
    ## Slide 1
    A paragraph with some text and a [link](https://hakim.se).
    ---
    ## Slide 2
    ---
    ## Slide 3
  </textarea>
</section>
```

## Element Attributes

Special syntax (through HTML comments) is available for adding attributes to Markdown elements. This is useful for fragments, among other things.

```html
<section data-markdown>
  <script type="text/template">
    - Item 1 <!-- .element: class="fragment" data-fragment-index="2" -->
    - Item 2 <!-- .element: class="fragment" data-fragment-index="1" -->
  </script>
</section>
```

## Slide Attributes

Special syntax (through HTML comments) is available for adding attributes to the slide `<section>` elements generated by your Markdown.

```html
<section data-markdown>
  <script type="text/template">
    <!-- .slide: data-background="#ff0000" -->
    ## Slide 1
    A paragraph with some text and an emoji 🤣.
    ---
    ## Slide 2
    ---
    ## Slide 3
  </script>
</section>
```

## Syntax Highlighting

Powerful syntax highlighting features are built into reveal.js. Using the bracket syntax shown below, you can highlight individual lines and even walk through multiple separate highlights step-by-step. [Learn more about line highlights](https://revealjs.com/code/#line-numbers-highlights).

````html
<section data-markdown>
  <textarea data-template>
    ```js [1-2|3|4]
    let a = 1;
    let b = 2;
    let c = x => 1 + 2 + x;
    c(3);
    ```
  </textarea>
</section>
````

### Line Number Offset

You can add a line number offset by adding a number and a colon at the beginning of your highlights.

````html
<section data-markdown>
  <textarea data-template>
    ```js [712: 1-2|3|4]
    let a = 1;
    let b = 2;
    let c = x => 1 + 2 + x;
    c(3);
    ```
  </textarea>
</section>
````