"""Bundle the app into one self-contained HTML file: python3 build-single-file.py"""
import pathlib

root = pathlib.Path(__file__).parent
html = (root / 'index.html').read_text()
html = html.replace('<link rel="stylesheet" href="css/styles.css">',
                    '<style>\n' + (root / 'css/styles.css').read_text() + '</style>')
for src in ['js/knowledge.js', 'js/engine.js', 'js/labs.js', 'js/questionnaire.js', 'js/foods.js', 'js/docs.js', 'js/shop.js', 'js/store.js', 'sample/demo-family.js', 'js/app.js']:
    tag = '<script src="%s"></script>' % src
    assert tag in html, tag
    html = html.replace(tag, '<script>\n' + (root / src).read_text() + '</script>')
(root / 'Family-Health-Guide.html').write_text(html)
print('wrote Family-Health-Guide.html', len(html.encode()), 'bytes')
