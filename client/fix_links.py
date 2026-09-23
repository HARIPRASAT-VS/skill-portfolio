import os
import glob

def fix_links(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The dynamic link logic
    # We replace <Button ...>View Public Portfolio ...</Button> with <Link to={`/portfolio/${profile?.user?.username || 'hariprasat'}`}><Button ...>View Public Portfolio ...</Button></Link>
    
    if 'View Public Portfolio' in content and 'Link to={`/portfolio' not in content:
        # First ensure Link is imported from react-router-dom
        if 'import { Link } from \'react-router-dom\'' not in content and 'import { Link' not in content:
            if 'import { useState' in content:
                content = content.replace('import { useState', 'import { Link } from \'react-router-dom\';\nimport { useState')
            elif 'import { usePortfolioStore' in content:
                content = content.replace('import { usePortfolioStore', 'import { Link } from \'react-router-dom\';\nimport { usePortfolioStore')

        # Simple replacement for all lines having Button and View Public Portfolio
        import re
        content = re.sub(r'(<Button[^>]*>View Public Portfolio.*?</Button>)', r'<Link to={`/portfolio/${profile?.user?.username || \'hariprasat\'}`}><\1></Link>', content)
        
        # Need to fix the nested <\1> since we matched the whole tag
        content = re.sub(r'<Link to={`/portfolio/\${profile\?\.user\?\.username \|\| \'hariprasat\'}`}><(<Button[^>]*>View Public Portfolio.*?</Button>)></Link>', r'<Link to={`/portfolio/${profile?.user?.username || \'hariprasat\'}`}>\1</Link>', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

pages_dir = 'c:/STUDENT_PROTOTYPE/SkillFolio/client/src/pages'
for filename in glob.glob(os.path.join(pages_dir, '*.tsx')):
    fix_links(filename)

# Also check DashboardLayout if it has the button
layouts_dir = 'c:/STUDENT_PROTOTYPE/SkillFolio/client/src/layouts'
for filename in glob.glob(os.path.join(layouts_dir, '*.tsx')):
    fix_links(filename)

print("Links fixed.")
