import os
import glob

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Safe array methods replacement
    content = content.replace('p.relatedSkillIds.includes', '(p.relatedSkillIds || []).includes')
    content = content.replace('c.relatedSkillIds.includes', '(c.relatedSkillIds || []).includes')
    content = content.replace('a.relatedSkillIds.includes', '(a.relatedSkillIds || []).includes')
    content = content.replace('project.technologies.some', '(project.technologies || []).some')
    content = content.replace('project.technologies.includes', '(project.technologies || []).includes')
    content = content.replace('profile.github.includes', '(profile.github || "").includes')
    content = content.replace('profile.linkedin.includes', '(profile.linkedin || "").includes')
    
    # Fix for formData cases where it was failing
    content = content.replace('formData.technologies?.includes', '(formData.technologies || []).includes')
    content = content.replace('formData.relatedSkillIds?.includes', '(formData.relatedSkillIds || []).includes')
    content = content.replace('formData.relatedProjectIds?.includes', '(formData.relatedProjectIds || []).includes')
    
    # Fix length issues
    content = content.replace('project.technologies.length', '(project.technologies || []).length')
    content = content.replace('data.skills.length', '(data.skills || []).length')
    content = content.replace('data.projects.length', '(data.projects || []).length')
    content = content.replace('data.certifications.length', '(data.certifications || []).length')
    content = content.replace('data.achievements.length', '(data.achievements || []).length')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

pages_dir = 'c:/STUDENT_PROTOTYPE/SkillFolio/client/src/pages'
for filename in glob.glob(os.path.join(pages_dir, '*.tsx')):
    fix_file(filename)

print("Arrays fixed.")
