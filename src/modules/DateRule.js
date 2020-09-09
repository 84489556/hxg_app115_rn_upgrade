
export function getView(value)
{
    let playCount = "" + value;
    if (value > 9999) {
        let number = value / 10000;
        let result = number.toString().substring(0, number.toString().indexOf(".") + 2);
        playCount = result + "万";
    }
    return playCount;
}


