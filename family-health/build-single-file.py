"""Bundle the app into one self-contained HTML file: python3 build-single-file.py"""
import pathlib

root = pathlib.Path(__file__).parent
html = (root / 'index.html').read_text()
html = html.replace('<link rel="stylesheet" href="css/styles.css">',
                    '<style>\n' + (root / 'css/styles.css').read_text() + '</style>')
for src in ['js/knowledge.js', 'js/labs.js', 'js/foods.js', 'js/nutrition.js', 'js/reviews.js', 'js/personal.js', 'js/engine.js', 'js/questionnaire.js', 'js/dietbook.js', 'js/workout.js', 'js/planner.js', 'js/docs.js', 'js/shop.js', 'js/store.js', 'sample/demo-family.js', 'js/app.js']:
    tag = '<script src="%s"></script>' % src
    assert tag in html, tag
    html = html.replace(tag, '<script>\n' + (root / src).read_text() + '</script>')
(root / 'Family-Health-Guide.html').write_text(html)
print('wrote Family-Health-Guide.html', len(html.encode()), 'bytes')

# The three design directions, each as a self-contained file next to the app.
import re
for name, title in [('pulse', 'Direction-A-Pulse'), ('chart', 'Direction-B-Chart'), ('table', 'Direction-C-Table')]:
    page = (root / 'directions' / (name + '.html')).read_text()
    def inline(m):
        src = m.group(1)
        path = root / 'directions' / src
        return '<script>\n' + path.read_text() + '</script>'
    page = re.sub(r'<script src="([^"]+)"></script>', inline, page)
    page = page.replace('href="../index.html', 'href="Family-Health-Guide.html')
    (root / (title + '.html')).write_text(page)
    print('wrote', title + '.html', len(page.encode()), 'bytes')
