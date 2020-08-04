import xml.etree.ElementTree as ET
from random import randrange
import json

WORD_LIST_FILE = "kotus-sanalista_v1/kotus-sanalista_v1.xml"
conjugations = "conjugation_types.json"
consonant_gradiations = "consonant_gradiation.json"


def get_word_info(word_list_file_name, words_with_conjugation_number):
    xml_tree = ET.parse(word_list_file_name)
    root = xml_tree.getroot()
    objectList = []
    two_parted_word_conjugations = []
    for child in root:
        conjugation_type = ""
        try:
            conjugation_type = child[1][0].text
        except LookupError:
            filteredFromTwoPartWordList = list(sorted(filter(lambda x : x['word'] in child[0].text, two_parted_word_conjugations), key=lambda j: len(j['word']), reverse=True))
            basic_part = get_correct_conjugation(child[0].text, filteredFromTwoPartWordList)
            conjugation_type = basic_part['conjugation_type']
            if conjugation_type == "":
                filteredFromAllConjugatedWordList = list(sorted(filter(lambda x : x['word'] in child[0].text, words_with_conjugation_number), key=lambda j: len(j['word']), reverse=True))
                basic_part = get_correct_conjugation(child[0].text, filteredFromAllConjugatedWordList)
                conjugation_type = basic_part['conjugation_type']
                two_parted_word_conjugations.append({'word': basic_part['word'], 'conjugation_type': basic_part['conjugation_type'] })
        try:
            gradiation = child[1][1].text
        except LookupError:
            gradiation = ""     
        objectList.append({"word": child[0].text, "conjugation_type": conjugation_type, "gradiation": gradiation})
    return objectList


def read_conjugated_words_to_list(word_list_file_name):
    xml_tree = ET.parse(word_list_file_name)
    word_list = []
    for child in xml_tree.getroot():
        try:
            word_list.append({"word": child[0].text, "conjugation_type": child[1][0].text})
        except LookupError:
            try: 
                word_list.append({"word": child[0].text, "conjugation_type": child[2][0].text})
            except LookupError:
                pass
    return word_list


def get_conjugations(word, conjugations):
    for conjugation in conjugations['conjugation_types']:
        if str(conjugation['type']) == str(word['conjugation_type']):
            return conjugation
    return "no conjugation"


def get_correct_conjugation(searchword, possible_conjugations):
    for word in possible_conjugations:
        if searchword.endswith(word['word']):
            return word
    return {"word": "", "conjugation_type": ""}


if __name__ == "__main__":
    
    words_with_conjugation_number = read_conjugated_words_to_list(WORD_LIST_FILE)
    
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
    
    
    with open(conjugations) as f:
        data = json.load(f)

    
    randomInteger = (randrange(len(object_list)))
    print(object_list[randomInteger])
    print(get_conjugations(object_list[randomInteger], data))
    