$ErrorActionPreference = "Stop"

function Convert-ImageToBase64($path) {
    try {
        $bytes = [System.IO.File]::ReadAllBytes($path)
        $base64 = [Convert]::ToBase64String($bytes)
        return "data:image/png;base64,$base64"
    } catch {
        Write-Warning "Failed to read image $path"
        return ""
    }
}

# 1. Login/Signup as Admin
$adminEmail = "admin_seed_$(Get-Random)@example.com"
$headers = @{ "Content-Type" = "application/json" }
$body = @{ name="AdminSeed"; email=$adminEmail; password="password"; role="ADMIN" } | ConvertTo-Json
try {
    Write-Host "Creating Admin Account: $adminEmail"
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signup" -Method Post -Headers $headers -Body $body
    $token = $response.token
    $headers["X-Auth-Token"] = $token
} catch {
    Write-Host "Signup failed, trying login with a known admin if possible, else stopping."
    throw $_
}

# 2. Define Data
# Categories
$categories = @(
    "Salad", "Rolls", "Deserts", "Sandwich", "Cake", "Pure Veg", "Pasta", "Noodles"
)

$catMap = @{}

# Create Categories
foreach ($catName in $categories) {
    Write-Host "Creating Category: $catName"
    $catBody = @{ name=$catName } | ConvertTo-Json
    try {
        $res = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/category" -Method Post -Headers $headers -Body $catBody
        $catMap[$catName] = $res.id
    } catch {
        Write-Warning "Failed to create category $catName"
    }
}

# Items Data (Manual extraction from assets.js)
$items = @(
    @{ name="Greek salad"; price=12; cat="Salad"; img="food_1.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Veg salad"; price=18; cat="Salad"; img="food_2.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Clover Salad"; price=16; cat="Salad"; img="food_3.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Chicken Salad"; price=24; cat="Salad"; img="food_4.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Lasagna Rolls"; price=14; cat="Rolls"; img="food_5.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Peri Peri Rolls"; price=12; cat="Rolls"; img="food_6.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Chicken Rolls"; price=20; cat="Rolls"; img="food_7.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Veg Rolls"; price=15; cat="Rolls"; img="food_8.png"; desc="Hand-rolled delights filled with savory ingredients and served with our signature dipping sauces." },
    @{ name="Ripple Ice Cream"; price=14; cat="Deserts"; img="food_9.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Fruit Ice Cream"; price=22; cat="Deserts"; img="food_10.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Jar Ice Cream"; price=10; cat="Deserts"; img="food_11.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Vanilla Ice Cream"; price=12; cat="Deserts"; img="food_12.png"; desc="A symphony of sweetness, from creamy classics to modern gourmet treats that melt in your mouth." },
    @{ name="Chicken Sandwich"; price=12; cat="Sandwich"; img="food_13.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Vegan Sandwich"; price=18; cat="Sandwich"; img="food_14.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Grilled Sandwich"; price=16; cat="Sandwich"; img="food_15.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Bread Sandwich"; price=24; cat="Sandwich"; img="food_16.png"; desc="Perfectly toasted layers of premium ingredients, offering a satisfying crunch in every bite." },
    @{ name="Cup Cake"; price=14; cat="Cake"; img="food_17.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Vegan Cake"; price=12; cat="Cake"; img="food_18.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Butterscotch Cake"; price=20; cat="Cake"; img="food_19.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Sliced Cake"; price=15; cat="Cake"; img="food_20.png"; desc="Exquisite, moist sponges layered with rich frosting and crafted for your most special moments." },
    @{ name="Garlic Mushroom "; price=14; cat="Pure Veg"; img="food_21.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Fried Cauliflower"; price=22; cat="Pure Veg"; img="food_22.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Mix Veg Pulao"; price=10; cat="Pure Veg"; img="food_23.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Rice Zucchini"; price=12; cat="Pure Veg"; img="food_24.png"; desc="Hearty and wholesome vegetarian specialties prepared with traditional techniques and modern flair." },
    @{ name="Cheese Pasta"; price=12; cat="Pasta"; img="food_25.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Tomato Pasta"; price=18; cat="Pasta"; img="food_26.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Creamy Pasta"; price=16; cat="Pasta"; img="food_27.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Chicken Pasta"; price=24; cat="Pasta"; img="food_28.png"; desc="Al dente perfections tossed in slow-simmered sauces and topped with the finest aged cheeses." },
    @{ name="Buttter Noodles"; price=14; cat="Noodles"; img="food_29.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Veg Noodles"; price=12; cat="Noodles"; img="food_30.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Somen Noodles"; price=20; cat="Noodles"; img="food_31.png"; desc="Fresh, crisp greens tossed with artisanal dressings and vibrant seasonal vegetables." },
    @{ name="Cooked Noodles"; price=15; cat="Noodles"; img="food_32.png"; desc="Wok-fired favorites infused with aromatic spices and authentic Asian flavors." }
)

$assetsPath = "d:\tmp\MomFood\Momfood\src\assets"

foreach ($item in $items) {
    if(-not $catMap.ContainsKey($item.cat)) {
        Write-Warning "Category $($item.cat) not found for item $($item.name)"
        continue
    }

    $imgPath = Join-Path $assetsPath $item.img
    $base64Img = ""
    if (Test-Path $imgPath) {
        $base64Img = Convert-ImageToBase64 $imgPath
    } else {
        Write-Warning "Image not found: $imgPath"
    }

    $payload = @{
        name = $item.name
        price = $item.price
        categoryId = $catMap[$item.cat]
        description = $item.desc
        imageUrl = $base64Img
    } | ConvertTo-Json

    Write-Host "Adding Item: $($item.name)"
    try {
        $null = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/food" -Method Post -Headers $headers -Body $payload
    } catch {
        Write-Warning "Failed to add $($item.name): $($_.Exception.Message)"
    }
}

Write-Host "Seeding Complete!"
