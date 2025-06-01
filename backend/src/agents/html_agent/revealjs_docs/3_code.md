# Presenting Code

reveal.js includes a powerful set of features aimed at presenting syntax highlighted code — powered by highlight.js This functionality lives in the highlight plugin and is included in our default presentation boilerplate.

Below is an example with clojure code that will be syntax highlighted. When the `data-trim` attribute is present, surrounding whitespace within the `<code>` is automatically removed.

HTML will be escaped by default. To avoid this, add `data-noescape` to the `<code>` element.

```html
<section>
  <pre><code data-trim data-noescape>
(def lazy-fib
  (concat
   [0 1]
   ((fn rfib [a b]
        (lazy-cons (+ a b) (rfib b (+ a b)))) 0 1)))
  </code></pre>
</section>
```

## Line Numbers & Highlights

You can enable line numbers by adding `data-line-numbers` to your `<code>` tags. If you want to highlight specific lines you can provide a comma separated list of line numbers using the same attribute. For example, in the following example lines 3 and 8-10 are highlighted:

```html
<pre><code data-line-numbers="3,8-10">
<table>
  <tr>
    <td>Apples</td>
    <td>$1</td>
    <td>7</td>
  </tr>
  <tr>
    <td>Oranges</td>
    <td>$2</td>
    <td>18</td>
  </tr>
</table>
</code></pre>
```

#### Line Number Offset 4.2.0

You can offset the line number if you want to showcase a excerpt of a longer set of code. In the example below, we set `data-ln-start-from="7"` to make the line numbers start from 7.

```html
<pre><code data-line-numbers data-ln-start-from="7">
<tr>
  <td>Oranges</td>
  <td>$2</td>
  <td>18</td>
</tr>
</code></pre>
```

## Step-by-step Highlights

You can step through multiple code highlights on the same code block. Delimit each of your highlight steps with the `|` character. For example `data-line-numbers="1|2-3|4,6-10"` will produce three steps. It will start by highlighting line 1, next step is lines 2-3, and finally line 4 and 6 through 10.

```html
<pre><code data-line-numbers="3-5|8-10|13-15">
<table>
  <tr>
    <td>Apples</td>
    <td>$1</td>
    <td>7</td>
  </tr>
  <tr>
    <td>Oranges</td>
    <td>$2</td>
    <td>18</td>
  </tr>
  <tr>
    <td>Kiwi</td>
    <td>$3</td>
    <td>1</td>
  </tr>
</table>
</code></pre>
```

## Language selection

By default, highlight.js tries to automatically detect which language is used in the code snippet. It is however possible to overwrite this by adding a `language-XXX` attribute.

```html
<pre><code data-trim class="language-python">
>>> import antigravity
>>> print(b"\x01\x02\x03")
>>> a = 2
</code></pre>
```

## HTML Entities 4.1.0

Content added inside of a `<code>` block is parsed as HTML by the web browser. If you have HTML characters (<>) in your code you will need to escape them ($lt; $gt;).

To avoid having to escape these characters manually, you can wrap your code in `<script type="text/template">` and we'll handle it for you.

```html
<pre><code><script type="text/template">
sealed class Either<out A, out B> {
  data class Left<out A>(val a: A) : Either<A, Nothing>()
  data class Right<out B>(val b: B) : Either<Nothing, B>()
}
</script></code></pre>
```