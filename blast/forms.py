from django import forms
from .models import BlastJob


class SearchForm(forms.ModelForm):
    class Meta:
        model = BlastJob
        fields = ['query']
        widgets = {
            'query':
            forms.TextInput(
                attrs={
                    'id': 'query-text',
                    'required': True,
                    'placeholder': 'single DNA sequence containing only the letter A,G,C and T'
                }),
        }