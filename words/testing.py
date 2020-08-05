import xml.etree.ElementTree as ET
from random import randrange
import json

WORD_LIST_FILE = 'kotus-sanalista_v1/kotus-sanalista_v1.xml'
conjugations = 'conjugation_types.json'
consonant_gradiations = 'consonant_gradiation.json'
from datetime import datetime

def get_word_info(word_list_file_name, words_with_conjugation_number):
    xml_tree = ET.parse(word_list_file_name)
    root = xml_tree.getroot()
    objectList = []
    compound_word_list = []
    for child in root:
        conjugation_type = ''
        gradiation = ''
        try:
            conjugation_type = child[1][0].text
        except LookupError:
            filtered_from_compound_word_list = list(sorted(filter(lambda x : x['word'] in child[0].text, compound_word_list), key=lambda j: len(j['word']), reverse=True))
            basic_part = get_correct_conjugation(child[0].text, filtered_from_compound_word_list)
            conjugation_type = basic_part['conjugation_type']
            gradiation = basic_part['gradiation']
            if conjugation_type == '':
                filtered_from_all_conjugated_words = list(sorted(filter(lambda x : x['word'] in child[0].text, words_with_conjugation_number), key=lambda j: len(j['word']), reverse=True))
                basic_part = get_correct_conjugation(child[0].text, filtered_from_all_conjugated_words)
                conjugation_type = basic_part['conjugation_type']
                gradiation = basic_part['gradiation']
                compound_word_list.append({'word': basic_part['word'], 'conjugation_type': basic_part['conjugation_type'], 'gradiation': basic_part['gradiation'] })
        if gradiation == '':
            try:
                gradiation = child[1][1].text
            except LookupError:
                pass
        objectList.append({'word': child[0].text, 'conjugation_type': conjugation_type, 'gradiation': gradiation})
    return objectList


def read_conjugated_words_to_list(word_list_file_name):
    xml_tree = ET.parse(word_list_file_name)
    word_list = []
    for child in xml_tree.getroot():
        try:
            conjugation_type = child[1][0].text
            try:
                gradiation = child[1][1].text
            except LookupError:
                gradiation = ''
            word_list.append({'word': child[0].text, 'conjugation_type': conjugation_type, 'gradiation': gradiation})
        except LookupError:
            try: 
                conjugation_type = child[2][0].text
                try: 
                    gradiation = child[2][1].text
                except:
                    gradiation = ''
                word_list.append({'word': child[0].text, 'conjugation_type': conjugation_type, 'gradiation': gradiation})
            except LookupError:
                pass
    return word_list


def get_conjugations(word, conjugations):
    for conjugation in conjugations['conjugation_types']:
        if str(conjugation['type']) == str(word['conjugation_type']):
            return conjugation
    return 'no conjugation'

def get_gradiation(word, gradiations):
    for gradiation in gradiations['consonant_gradiations']:
        if str(gradiation['type']) == str(word['gradiation']):
            return gradiation
    return 'no gradiation'

def get_correct_conjugation(searchword, possible_conjugations):
    for word in possible_conjugations:
        if searchword.endswith(word['word']):
            return word
    return {'word': '', 'conjugation_type': '', 'gradiation': ''}



if __name__ == '__main__':
    
    words_with_conjugation_number = read_conjugated_words_to_list(WORD_LIST_FILE)
    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")
    print('-----------------')
    print("Before getting conjugations =", current_time)
    
#    print('-----------------')
#    search = 'alfasäteet'
#    #search = 'jakelukustannukset'
#    #search = 'aarnio'
#    print('haettava sana:')
#    print(search)
#    filtered = list(sorted(filter(lambda x : x['word'] in search, words_with_conjugation_number), key=lambda j: len(j['word']), reverse=True))
#    print('-----------------')
#    print('filtteröity lista:')
#    print(filtered)
#    correct_conjugation = get_correct_conjugation(search, filtered)
#    print('-----------------')
#    print('oikea taivutusobjekti:')
#    print(correct_conjugation)
    
    object_list = get_word_info(WORD_LIST_FILE, words_with_conjugation_number)
    
    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")
    print('-----------------')
    print("After getting conjugations =", current_time)
    
    with open(conjugations) as f:
        conjugations_data = json.load(f)
    
    with open(consonant_gradiations) as f:
        gradiation_data = json.load(f)
        
    randomInteger = (randrange(len(object_list)))
    print('-----------------')
    print('fetching object with index: ', randomInteger)
    print(object_list[randomInteger])
    print(get_conjugations(object_list[randomInteger], conjugations_data))
    print(get_gradiation(object_list[randomInteger], gradiation_data))