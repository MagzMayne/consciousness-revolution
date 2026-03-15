
html = open("character.html").read()
# Add matrix CSS after spectrum-labels .positive
new_css = """.character-matrix { margin-top: 30px; }
.matrix-header { display: grid; grid-template-columns: 120px 1fr 1fr 1fr; gap: 3px; margin-bottom: 3px; }
.matrix-header-cell { padding: 12px; text-align: center; font-weight: bold; font-size: 0.85rem; border-radius: 8px 8px 0 0; }
.matrix-header-cell.negative { background: rgba(231, 76, 60, 0.3); color: #e74c3c; }
.matrix-header-cell.middle { background: rgba(241, 196, 15, 0.3); color: #f1c40f; }
.matrix-header-cell.positive { background: rgba(46, 204, 113, 0.3); color: #2ecc71; }
.matrix-row { display: grid; grid-template-columns: 120px 1fr 1fr 1fr; gap: 3px; margin-bottom: 3px; }
@media (max-width: 800px) { .matrix-row, .matrix-header { grid-template-columns: 1fr; } .matrix-header { display: none; } }
.matrix-category { background: linear-gradient(135deg, #2a2a4a, #1a1a2e); padding: 15px 8px; font-size: 0.7rem; font-weight: bold; color: #9b59b6; display: flex; align-items: center; justify-content: center; text-align: center; border-radius: 8px 0 0 8px; }
.matrix-cell { padding: 12px 10px; text-align: center; font-size: 0.9rem; line-height: 1.3; }
.matrix-cell.negative { background: rgba(231, 76, 60, 0.12); border-left: 3px solid #e74c3c; }
.matrix-cell.negative .trait { color: #e74c3c; font-weight: bold; }
.matrix-cell.middle { background: rgba(241, 196, 15, 0.08); border-left: 3px solid #f1c40f; }
.matrix-cell.middle .trait { color: #f1c40f; font-weight: bold; }
.matrix-cell.positive { background: rgba(46, 204, 113, 0.12); border-left: 3px solid #2ecc71; border-radius: 0 8px 8px 0; }
.matrix-cell.positive .trait { color: #2ecc71; font-weight: bold; }
.matrix-cell .detail { display: block; color: #666; font-size: 0.75rem; margin-top: 4px; font-style: italic; }
.your-position { background: linear-gradient(135deg, rgba(155, 89, 182, 0.15), rgba(91, 94, 166, 0.15)); border: 2px solid rgba(155, 89, 182, 0.4); border-radius: 12px; padding: 20px; margin-top: 30px; text-align: center; }
.your-position p { color: #ccc; font-size: 0.95rem; line-height: 1.7; }
.your-position strong { color: #f1c40f; }
.your-position em { color: #2ecc71; font-style: normal; font-weight: bold; }
"""
print("Done")
