import pyphen

dic = pyphen.Pyphen(lang='en_US')

def process_text(text):
    words = text.split()
    res = []
    for w in words:
        # Pyphen automatically adds the requested delimiter
        res.append(dic.inserted(w, '-'))
    
    return " ".join(res)