import type { FormField, FormConfig } from '@/types';

function getInputHtml(field: FormField, indent: string = '  '): string {
  const requiredAttr = field.required ? ' required' : '';
  const nameAttr = field.label.toLowerCase().replace(/[^a-z0-9]/g, '_');

  switch (field.type) {
    case 'textarea':
      return `${indent}<textarea name="${nameAttr}" placeholder="${field.label}"${requiredAttr}></textarea>`;
    case 'select': {
      const options = (field.options ?? [])
        .map((opt) => `${indent}  <option value="${opt}">${opt}</option>`)
        .join('\n');
      return `${indent}<select name="${nameAttr}"${requiredAttr}>\n${indent}  <option value="">Select ${field.label}</option>\n${options}\n${indent}</select>`;
    }
    default:
      return `${indent}<input type="${field.type}" name="${nameAttr}" placeholder="${field.label}"${requiredAttr} />`;
  }
}

export function generateEmbedSnippet(config: FormConfig, deploymentUrl: string): string {
  const fieldInputs = config.fields.map((f) => getInputHtml(f)).join('\n');
  const formId = `rg-form-${Math.random().toString(36).slice(2, 7)}`;

  return `<form class="rgforms-form" id="${formId}"
      action="${deploymentUrl}"
      method="POST">
${fieldInputs}
  <button type="submit">Send</button>
  <div id="${formId}-success" style="display:none">
    Thanks! Your message has been sent.
  </div>
</form>
<script>
  document.getElementById('${formId}').addEventListener('submit', function(e) {
    e.preventDefault();
    var form = this;
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    fetch(form.action, { method: 'POST', body: new FormData(form), mode: 'no-cors' })
      .then(function() {
        document.getElementById('${formId}-success').style.display = 'block';
        form.reset();
        btn.disabled = false;
        btn.textContent = 'Send';
      })
      .catch(function() {
        btn.disabled = false;
        btn.textContent = 'Send';
        alert('Something went wrong. Please try again.');
      });
  });
</script>`;
}
